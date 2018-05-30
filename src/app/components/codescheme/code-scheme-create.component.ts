import { Component } from '@angular/core';
import { AsyncValidatorFn, AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { EditableService } from '../../services/editable.service';
import { LinkListModalService } from './link-list-modal.component';
import { LinkShowModalService } from './link-show-modal.component';
import { LinkEditModalService } from './link-edit-modal.component';
import { Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { Status } from 'yti-common-ui/entities/status';
import { Code } from '../../entities/code';
import { formatDate, validDateRange } from '../../utils/date';
import { CodeSchemeType } from '../../services/api-schema';
import { Observable } from 'rxjs/Observable';
import { requiredList } from 'yti-common-ui/utils/validator';
import {ignoreModalClose} from 'yti-common-ui/utils/modal';
import {Concept} from '../../entities/concept';
import {TerminologyIntegrationModalService} from '../terminology-integration/terminology-integration-codescheme-modal.component';
import {hasLocalization} from 'yti-common-ui/utils/localization';
import { CodePlain } from '../../entities/code-simple';

@Component({
  selector: 'app-code-scheme-create',
  templateUrl: './code-scheme-create.component.html',
  styleUrls: ['./code-scheme-create.component.scss'],
  providers: [EditableService]
})
export class CodeSchemeCreateComponent {

  codeRegistriesLoaded = false;
  dev: boolean;

  codeSchemeForm = new FormGroup({
    codeValue: new FormControl('', [Validators.required, this.isCodeValuePatternValid]),
    prefLabel: new FormControl({}),
    description: new FormControl({}),
    definition: new FormControl({}),
    version: new FormControl(''),
    source: new FormControl(''),
    legalBase: new FormControl(''),
    governancePolicy: new FormControl(''),
    validity: new FormControl({ start: null, end: null }, validDateRange),
    dataClassifications: new FormControl([], [requiredList]),
    defaultCode: new FormControl(null),
    status: new FormControl('DRAFT' as Status),
    codeRegistry: new FormControl(null, Validators.required),
    conceptUriInVocabularies: new FormControl(''),
  }, null, this.codeValueExistsValidator());

  constructor(private router: Router,
              private dataService: DataService,
              private linkEditModalService: LinkEditModalService,
              private linkShowModalService: LinkShowModalService,
              private linkListModalService: LinkListModalService,
              private editableService: EditableService,
              private terminologyIntegrationModalService: TerminologyIntegrationModalService) {

    editableService.onSave = (formValue: any) => this.save(formValue);
    editableService.cancel$.subscribe(() => this.back());
    this.editableService.edit();

    dataService.getServiceConfiguration().subscribe(configuration => {
      this.dev = configuration.dev;
    });
  }

  get isDev() {
    return this.dev;
  }

  get loading(): boolean {
    return !this.codeRegistriesLoaded;
  }

  back() {
    this.router.navigate(['importandcreatecodescheme']);
  }

  save(formData: any): Observable<any> {

    console.log('Saving new CodeScheme');

    const { validity, codeRegistry, defaultCode, dataClassifications, ...rest } = formData;

    const codeScheme: CodeSchemeType = <CodeSchemeType> {
      ...rest,
      startDate: formatDate(validity.start),
      endDate: formatDate(validity.end),
      codeRegistry: codeRegistry.serialize(),
      defaultCode: defaultCode ? defaultCode.serialize() : undefined,
      dataClassifications: dataClassifications.map((dc: CodePlain) => dc.serialize())
    };

    return this.dataService.createCodeScheme(codeScheme, codeRegistry.codeValue)
      .do(createdCodeScheme => {
        console.log('Saved new CodeScheme');
        this.router.navigate(createdCodeScheme.route);
      });
  }

  isCodeValuePatternValid (control: AbstractControl) {
    const isCodeValueValid = control.value.match(/^[a-zA-Z0-9_\-]*$/);
    return !isCodeValueValid ? {'codeValueValidationError': {value: control.value}} : null;
  }

  codeValueExistsValidator(): AsyncValidatorFn {
    return (control: AbstractControl) => {
      const registryCode = control.value.codeRegistry ? control.value.codeRegistry.codeValue : '';
      const schemeCode = control.value.codeValue;
      const validationError = {
        codeSchemeCodeValueExists: {
          valid: false
        }
      };
      return this.dataService.codeSchemeCodeValueExists(registryCode, schemeCode)
        .map(exists => exists ? validationError : null);
    };
  }

  openTerminologyModal() {
    this.terminologyIntegrationModalService.open().then(concept => this.putConceptStuffInPlace(concept), ignoreModalClose);
  }

  removeConceptUriInVocabularies() {
    this.codeSchemeForm.controls['conceptUriInVocabularies'].setValue('');
  }

  putConceptStuffInPlace(concept: Concept) {
    if (!hasLocalization(this.codeSchemeForm.controls['prefLabel'].value)) {
      this.codeSchemeForm.patchValue({prefLabel: concept.prefLabel});
    }
    if (!hasLocalization(this.codeSchemeForm.controls['definition'].value)) {
      this.codeSchemeForm.patchValue({definition: concept.definition});
    }
    this.codeSchemeForm.patchValue({conceptUriInVocabularies: concept.uri});
  }
}
