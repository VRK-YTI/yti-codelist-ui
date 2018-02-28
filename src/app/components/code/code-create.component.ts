import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { EditableService } from '../../services/editable.service';
import { DataService } from '../../services/data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { formatDate, validDateRange } from '../../utils/date';
import { CodeScheme } from '../../entities/code-scheme';
import { CodeType } from '../../services/api-schema';
import { Status } from 'yti-common-ui/entities/status';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-code-create',
  templateUrl: './code-create.component.html',
  styleUrls: ['./code-create.component.scss'],
  providers: [EditableService]
})
export class CodeCreateComponent implements OnInit {

  codeScheme: CodeScheme;

  codeForm = new FormGroup({
    codeValue: new FormControl('', Validators.required),
    prefLabel: new FormControl({}),
    description: new FormControl({}),
    shortName: new FormControl(''),
    validity: new FormControl(null, validDateRange),
    status: new FormControl('DRAFT' as Status)
  });

  constructor(private dataService: DataService,
              private route: ActivatedRoute,
              private router: Router,
              private editableService: EditableService) {

    editableService.onSave = (formValue: any) => this.save(formValue);
    editableService.cancel$.subscribe(() => this.back());
    this.editableService.edit();
  }

  ngOnInit() {
    console.log('CodeCreateComponent onInit');
    const registryCode = this.route.snapshot.params.codeRegistryCodeValue;
    console.log('CodeCreateComponent onInit registryCode: ' + registryCode);
    const schemeId = this.route.snapshot.params.codeSchemeId;
    console.log('CodeCreateComponent onInit schemeId: ' + schemeId);

    if (!registryCode || !schemeId) {
      throw new Error(`Illegal route, registry: '${registryCode}', scheme: '${schemeId}'`);
    }

    this.dataService.getCodeScheme(registryCode, schemeId).subscribe(codeScheme => {
      this.codeScheme = codeScheme;
    });
  }

  back() {
    this.router.navigate(this.codeScheme.route);
  }

  save(formData: any): Observable<any> {

    console.log('Saving new Code');

    const { validity, ...rest } = formData;

    const code: CodeType = {
      ...rest,
      startDate: formatDate(validity.start),
      endDate: formatDate(validity.end)
    };

    return this.dataService.createCode(code, this.codeScheme.codeRegistry.codeValue, this.codeScheme.id)
      .do(createdCode => {
        console.log('Saved new Code');
        this.router.navigate(createdCode.route);
      });
  }

  get loading(): boolean {
    return this.codeScheme == null;
  }
}
