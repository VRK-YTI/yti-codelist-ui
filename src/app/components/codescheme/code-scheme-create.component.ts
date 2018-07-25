import { Component, OnInit, AfterViewInit } from '@angular/core';
import { AsyncValidatorFn, AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { EditableService } from '../../services/editable.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { Status } from 'yti-common-ui/entities/status';
import { formatDate, validDateRange } from '../../utils/date';
import { CodeSchemeType } from '../../services/api-schema';
import { Observable } from 'rxjs/Observable';
import { requiredList } from 'yti-common-ui/utils/validator';
import { ignoreModalClose } from 'yti-common-ui/utils/modal';
import { Concept } from '../../entities/concept';
import { TerminologyIntegrationModalService } from '../terminology-integration/terminology-integration-codescheme-modal.component';
import { CodePlain } from '../../entities/code-simple';
import { CodeScheme } from '../../entities/code-scheme';
import { Location } from '@angular/common';
import { LocationService } from '../../services/location.service';
import { ExternalReference } from '../../entities/external-reference';

@Component({
  selector: 'app-code-scheme-create',
  templateUrl: './code-scheme-create.component.html',
  styleUrls: ['./code-scheme-create.component.scss'],
  providers: [EditableService]
})
export class CodeSchemeCreateComponent implements OnInit, AfterViewInit {

  codeRegistriesLoaded = false;
  env: string;
  uuidOfOriginalCodeSchemeIfCloning: string;
  pageTitle = 'Create code list';
  cloning = false;

  codeSchemeForm = new FormGroup({
    codeValue: new FormControl('', [Validators.required, this.isCodeValuePatternValid]),
    prefLabel: new FormControl({}),
    description: new FormControl({}),
    definition: new FormControl({}),
    changeNote: new FormControl({}),
    version: new FormControl(''),
    source: new FormControl(''),
    legalBase: new FormControl(''),
    governancePolicy: new FormControl(''),
    externalReferences: new FormControl([]),
    validity: new FormControl({ start: null, end: null }, validDateRange),
    dataClassifications: new FormControl([], [requiredList]),
    defaultCode: new FormControl(null),
    status: new FormControl('DRAFT' as Status),
    codeRegistry: new FormControl(null, Validators.required),
    conceptUriInVocabularies: new FormControl(''),
  }, null, this.codeValueExistsValidator());

  constructor(private router: Router,
              private dataService: DataService,
              private editableService: EditableService,
              private terminologyIntegrationModalService: TerminologyIntegrationModalService,
              private activatedRoute: ActivatedRoute,
              private location: Location,
              private locationService: LocationService) {

    editableService.onSave = (formValue: any) => this.save(formValue);
    editableService.cancel$.subscribe(() => this.back());
    this.editableService.edit();
  }

  ngOnInit() {

    this.dataService.getServiceConfiguration().subscribe(configuration => {
      this.env = configuration.env;
    });

    this.activatedRoute.queryParams.subscribe(params => {
      this.uuidOfOriginalCodeSchemeIfCloning = params['originalCodeSchemeId'];
      if (this.uuidOfOriginalCodeSchemeIfCloning) {
        this.cloning = true;
        this.dataService.getCodeSchemeWithUuid(this.uuidOfOriginalCodeSchemeIfCloning).subscribe(next => {
          const originalCodeScheme: CodeScheme = next;
          this.codeSchemeForm.patchValue({prefLabel: originalCodeScheme.prefLabel});
          this.codeSchemeForm.patchValue({codeValue: originalCodeScheme.codeValue});
          this.codeSchemeForm.patchValue({description: originalCodeScheme.description});
          this.codeSchemeForm.patchValue({definition: originalCodeScheme.definition});
          this.codeSchemeForm.patchValue({changeNote: originalCodeScheme.changeNote});
          this.codeSchemeForm.patchValue({version: originalCodeScheme.version});
          this.codeSchemeForm.patchValue({source: originalCodeScheme.source});
          this.codeSchemeForm.patchValue({legalBase: originalCodeScheme.legalBase});
          this.codeSchemeForm.patchValue({governancePolicy: originalCodeScheme.governancePolicy});
          this.codeSchemeForm.patchValue({validity: {start: originalCodeScheme.startDate, end: originalCodeScheme.endDate} });
          this.codeSchemeForm.patchValue({status: originalCodeScheme.status});
          this.codeSchemeForm.patchValue({conceptUriInVocabularies: originalCodeScheme.conceptUriInVocabularies});
          this.dataService.getDataClassificationsAsCodes().subscribe(next2 => {
            const allDataClassifications = next2;
            const dataClassificationsToCopy: CodePlain[] = [];
            originalCodeScheme.dataClassifications.forEach(function (originalClassification) {
              allDataClassifications.forEach(function(potentialClassification) {
                const uriToCompare = potentialClassification.codeScheme.uri + '/' + potentialClassification.codeValue;
                if (uriToCompare === originalClassification.uri) {
                  dataClassificationsToCopy.push(potentialClassification);
                }
              });
            });
            if (dataClassificationsToCopy.length > 0) {
              this.codeSchemeForm.patchValue({dataClassifications: dataClassificationsToCopy});
            }
          });
          this.locationService.atCreateNewVersionOfCodeSchemePage(originalCodeScheme);
        });
        this.pageTitle = 'createNewVersion';
      } else {
        this.locationService.atCodeSchemeCreatePage();
      }
    });
  }

  ngAfterViewInit() {
    if (!this.cloning) {
      setTimeout(() => {
        this.openTerminologyModal();
      });
    }
  }

  get showUnfinishedFeature() {
    return this.env === 'dev';
  }

  get loading(): boolean {
    return !this.codeRegistriesLoaded || !this.env;
  }

  back() {
    this.location.back();
  }

  save(formData: any): Observable<any> {

    console.log('Saving new CodeScheme');

    const { validity, codeRegistry, defaultCode, dataClassifications, externalReferences, ...rest } = formData;

    const codeScheme: CodeSchemeType = <CodeSchemeType> {
      ...rest,
      startDate: formatDate(validity.start),
      endDate: formatDate(validity.end),
      codeRegistry: codeRegistry.serialize(),
      defaultCode: defaultCode ? defaultCode.serialize() : undefined,
      dataClassifications: dataClassifications.map((dc: CodePlain) => dc.serialize()),
      externalReferences: externalReferences.map((er: ExternalReference) => er.serialize())
    };

    if (this.cloning) {
      console.log('Cloning CodeScheme');
      return this.dataService.cloneCodeScheme(codeScheme, codeRegistry.codeValue, this.uuidOfOriginalCodeSchemeIfCloning)
        .do(createdCodeScheme => {
          console.log('Saved cloned CodeScheme');
          this.router.navigate([
            'codescheme',
            {
              registryCode: codeRegistry.codeValue,
              schemeCode: codeScheme.codeValue
            }
          ]);
        });
    } else {
      console.log('Saving new CodeScheme');
      return this.dataService.createCodeScheme(codeScheme, codeRegistry.codeValue)
        .do(createdCodeScheme => {
          console.log('Saved new CodeScheme');
          this.router.navigate(createdCodeScheme.route);
        });
    }

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
    this.terminologyIntegrationModalService.open(false, 'codescheme').
    then(concept => this.putConceptStuffInPlace(concept), ignoreModalClose);
  }

  removeConceptUriInVocabularies() {
    this.codeSchemeForm.controls['conceptUriInVocabularies'].setValue('');
  }

  putConceptStuffInPlace(concept: Concept) {
    this.codeSchemeForm.patchValue({prefLabel: concept.prefLabel});
    this.codeSchemeForm.patchValue({definition: concept.definition});
    this.codeSchemeForm.patchValue({conceptUriInVocabularies: concept.uri});
  }
}
