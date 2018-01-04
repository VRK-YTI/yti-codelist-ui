import { Component, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { CodeScheme } from '../../entities/code-scheme';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { EditableService } from '../../services/editable.service';
import { LinkListModalService } from './link-list-modal.component';
import { LinkShowModalService } from './link-show-modal.component';
import { LinkEditModalService } from './link-edit-modal.component';
import { CodeListConfirmationModalService } from '../common/confirmation-modal.service';
import { Router } from '@angular/router';
import { CodeRegistry } from '../../entities/code-registry';
import { DataService } from '../../services/data.service';
import { selectableStatuses } from 'yti-common-ui/entities/status';
import { Code } from '../../entities/code';
import { fromPickerDate, toPickerDate } from '../../utils/date';

@Component({
  selector: 'app-code-scheme-create',
  templateUrl: './code-scheme-create.component.html',
  styleUrls: ['./code-scheme-create.component.scss'],
  providers: [EditableService]
})
export class CodeSchemeCreateComponent implements OnInit, OnChanges, OnDestroy {

  codeScheme: CodeScheme;
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
    endDate: new FormControl()
  });

  cancelSubscription: Subscription;

  constructor(private router: Router,
              private dataService: DataService,
              private linkEditModalService: LinkEditModalService,
              private linkShowModalService: LinkShowModalService,
              private linkListModalService: LinkListModalService,
              private editableService: EditableService,
              private confirmationModalService: CodeListConfirmationModalService) {

    this.cancelSubscription = editableService.cancel$.subscribe(() => this.reset());
  }

  ngOnInit() {
    this.codeScheme = new CodeScheme();
    this.codeScheme.status = 'DRAFT';
    this.dataService.getCodeRegistries().subscribe(codeRegistries => {
      this.codeRegistries = codeRegistries;
    });
    this.dataService.getDataClassificationsAsCodes().subscribe(dataClassifications => {
      this.dataClassifications = dataClassifications;
    });
    this.editableService.edit();
  }

  setRegistry(codeRegistry: CodeRegistry) {
    this.codeScheme.codeRegistry = codeRegistry;
  }

  setDataClassification(dataClassification: Code) {
    this.codeScheme.dataClassifications = [];
    this.codeScheme.dataClassifications[0] = dataClassification;
  }

  get statuses(): string[] {
    return selectableStatuses;
  }

  get loading(): boolean {
    return this.codeRegistries == null || this.dataClassifications == null;
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.reset();
  }

  private reset() {
    const { externalReferences, ...rest } = this.codeScheme;

    this.codeSchemeForm.reset(Object.assign({}, rest, {
      startDate: toPickerDate(this.codeScheme.startDate),
      endDate: toPickerDate(this.codeScheme.endDate)
    }));
  }

  back() {
    this.router.navigate(['importandcreatecodescheme']);
  }

  get operationPending() {
    return this.saving;
  }

  get editing() {
    return this.editableService.editing;
  }

  get saving() {
    return this.editableService.saving;
  }

  save() {
    console.log('Saving new CodeScheme');
    this.editableService.saving$.next(true);

    const { startDate, endDate, ...rest } = this.codeSchemeForm.value;

    this.dataService.createCodeScheme(Object.assign({}, this.codeScheme, rest, {
      startDate: fromPickerDate(startDate),
      endDate: fromPickerDate(endDate)
    }), this.codeScheme.codeRegistry.codeValue)
      .subscribe(codeSchemes => {
        console.log('Saved new CodeScheme');
        if (codeSchemes.length > 0) {
          this.router.navigate(codeSchemes[0].route);
        }
        this.editableService.saving$.next(false);
      }, error => {
        // TODO proper error handling!
        console.log('Error creating CodeScheme: ' + error);
        this.editableService.saving$.next(false);
      });
  }

  canSave() {
    // TODO check form validity more properly here!
    return this.codeSchemeForm.valid &&
      this.codeScheme.codeRegistry !== undefined &&
      !this.saving && this.codeScheme.dataClassifications !== undefined &&
      this.codeScheme.dataClassifications.length > 0;
  }

  ngOnDestroy() {
    this.cancelSubscription.unsubscribe();
  }
}