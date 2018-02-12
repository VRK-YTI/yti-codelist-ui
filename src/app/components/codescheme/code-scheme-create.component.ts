import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { EditableService } from '../../services/editable.service';
import { LinkListModalService } from './link-list-modal.component';
import { LinkShowModalService } from './link-show-modal.component';
import { LinkEditModalService } from './link-edit-modal.component';
import { Router } from '@angular/router';
import { CodeRegistry } from '../../entities/code-registry';
import { DataService } from '../../services/data.service';
import { Status } from 'yti-common-ui/entities/status';
import { Code } from '../../entities/code';
import { formatDate, fromPickerDate } from '../../utils/date';
import { normalizeAsArray } from 'yti-common-ui/utils/array';
import { CodeSchemeType } from '../../services/api-schema';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-code-scheme-create',
  templateUrl: './code-scheme-create.component.html',
  styleUrls: ['./code-scheme-create.component.scss'],
  providers: [EditableService]
})
export class CodeSchemeCreateComponent implements OnInit {

  codeRegistries: CodeRegistry[];
  dataClassifications: Code[];

  codeSchemeForm = new FormGroup({
    codeValue: new FormControl('', Validators.required),
    prefLabel: new FormControl({}),
    description: new FormControl({}),
    definition: new FormControl({}),
    source: new FormControl(''),
    legalBase: new FormControl(''),
    governancePolicy: new FormControl(''),
    license: new FormControl(''),
    startDate: new FormControl(),
    endDate: new FormControl(),
    dataClassifications: new FormControl([]),
    status: new FormControl('DRAFT' as Status),
    codeRegistry: new FormControl(null, Validators.required)
  });

  constructor(private router: Router,
              private dataService: DataService,
              private linkEditModalService: LinkEditModalService,
              private linkShowModalService: LinkShowModalService,
              private linkListModalService: LinkListModalService,
              private editableService: EditableService) {

    editableService.onSave = (formValue: any) => this.save(formValue);
    editableService.cancel$.subscribe(() => this.back());
    this.editableService.edit();
  }

  ngOnInit() {
    this.dataService.getCodeRegistriesForUser().subscribe(codeRegistries => {
      this.codeRegistries = codeRegistries;
    });
  }

  set codeRegistry(codeRegistry: CodeRegistry) {
    this.codeRegistryControl.setValue(codeRegistry);
  }

  get codeRegistry(): CodeRegistry {
    return this.codeRegistryControl.value;
  }

  private get codeRegistryControl() {

    const crControl = this.codeSchemeForm.get('codeRegistry');

    if (crControl == null) {
      throw new Error('Form control not found');
    }

    return crControl;
  }

  get loading(): boolean {
    return this.codeRegistries == null;
  }

  back() {
    this.router.navigate(['importandcreatecodescheme']);
  }

  save(formData: any): Observable<any> {

    console.log('Saving new CodeScheme');

    const { startDate, endDate, codeRegistry, dataClassifications, ...rest } = formData;

    const codeScheme: CodeSchemeType = {
      ...rest,
      startDate: formatDate(fromPickerDate(startDate)),
      endDate: formatDate(fromPickerDate(endDate)),
      codeRegistry: codeRegistry.serialize(),
      dataClassifications: dataClassifications.map((dc: Code) => dc.serialize())
    };

    return this.dataService.createCodeScheme(codeScheme, codeRegistry.codeValue)
      .do(createdCodeScheme => {
        console.log('Saved new CodeScheme');
        this.router.navigate(createdCodeScheme.route);
      });
  }
}
