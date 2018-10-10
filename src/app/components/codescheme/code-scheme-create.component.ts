import { AfterViewInit, Component, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup, Validators } from '@angular/forms';
import { EditableService } from '../../services/editable.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { restrictedStatuses, Status } from 'yti-common-ui/entities/status';
import { formatDate, validDateRange } from '../../utils/date';
import { CodeSchemeType } from '../../services/api-schema';
import { from, Observable } from 'rxjs';
import { requiredList } from 'yti-common-ui/utils/validator';
import { ignoreModalClose } from 'yti-common-ui/utils/modal';
import { Concept } from '../../entities/concept';
import { TerminologyIntegrationModalService } from '../terminology-integration/terminology-integration-codescheme-modal.component';
import { CodePlain } from '../../entities/code-simple';
import { CodeScheme } from '../../entities/code-scheme';
import { Location } from '@angular/common';
import { LocationService } from '../../services/location.service';
import { ExternalReference } from '../../entities/external-reference';
import { LanguageService } from '../../services/language.service';
import { flatMap, map, tap } from 'rxjs/operators';
import { contains } from 'yti-common-ui/utils/array';
import { CodeListConfirmationModalService } from '../common/confirmation-modal.service';
import { Organization } from '../../entities/organization';

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
  allLanguageCodes: CodePlain[];

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
    languageCodes: new FormControl([], [requiredList]),
    defaultCode: new FormControl(null),
    status: new FormControl('DRAFT' as Status),
    codeRegistry: new FormControl(null, Validators.required),
    conceptUriInVocabularies: new FormControl(''),
    organizations: new FormControl([], [requiredList])
  }, null, this.codeValueExistsValidator());

  constructor(private router: Router,
              private dataService: DataService,
              private editableService: EditableService,
              private terminologyIntegrationModalService: TerminologyIntegrationModalService,
              private activatedRoute: ActivatedRoute,
              private location: Location,
              private languageService: LanguageService,
              private locationService: LocationService,
              private confirmationModalService: CodeListConfirmationModalService) {

    editableService.onSave = (formValue: any) => this.save(formValue);
    editableService.cancel$.subscribe(() => this.back());
    this.editableService.edit();
  }

  ngOnInit() {

    this.dataService.getServiceConfiguration().subscribe(configuration => {
      this.env = configuration.env;
    });

    this.dataService.getLanguageCodes(this.languageService.language).subscribe(languageCodes => {
      this.allLanguageCodes = languageCodes;
      this.setDefaultLanguageCodes();
    });

    this.activatedRoute.queryParams.subscribe(params => {
      this.uuidOfOriginalCodeSchemeIfCloning = params['originalCodeSchemeId'];
      if (this.uuidOfOriginalCodeSchemeIfCloning) {
        this.cloning = true;
        this.codeRegistriesLoaded = true; // when cloning, no registries are needed, need to fake loading is ready
        this.dataService.getCodeSchemeWithUuid(this.uuidOfOriginalCodeSchemeIfCloning).subscribe(next => {
          const originalCodeScheme: CodeScheme = next;
          this.codeSchemeForm.patchValue({ prefLabel: originalCodeScheme.prefLabel });
          this.codeSchemeForm.patchValue({ codeValue: originalCodeScheme.codeValue });
          this.codeSchemeForm.patchValue({ description: originalCodeScheme.description });
          this.codeSchemeForm.patchValue({ definition: originalCodeScheme.definition });
          this.codeSchemeForm.patchValue({ changeNote: originalCodeScheme.changeNote });
          this.codeSchemeForm.patchValue({ version: originalCodeScheme.version });
          this.codeSchemeForm.patchValue({ source: originalCodeScheme.source });
          this.codeSchemeForm.patchValue({ legalBase: originalCodeScheme.legalBase });
          this.codeSchemeForm.patchValue({ governancePolicy: originalCodeScheme.governancePolicy });
          this.codeSchemeForm.patchValue({
            validity: {
              start: originalCodeScheme.startDate,
              end: originalCodeScheme.endDate
            }
          });
          this.codeSchemeForm.patchValue({ status: originalCodeScheme.status });
          this.codeSchemeForm.patchValue({ conceptUriInVocabularies: originalCodeScheme.conceptUriInVocabularies });
          this.codeSchemeForm.patchValue({ codeRegistry: originalCodeScheme.codeRegistry }); // when cloning, enforce same registry
          this.codeSchemeForm.patchValue({ organizations: originalCodeScheme.organizations });
          this.dataService.getDataClassificationsAsCodes(this.languageService.language).subscribe(next2 => {
            const allDataClassifications = next2;
            const dataClassificationsToCopy: CodePlain[] = [];
            originalCodeScheme.dataClassifications.forEach(function (originalClassification) {
              allDataClassifications.forEach(function (potentialClassification) {
                const uriToCompare = potentialClassification.codeScheme.uri + '/code/' + potentialClassification.codeValue;
                if (uriToCompare === originalClassification.uri) {
                  dataClassificationsToCopy.push(potentialClassification);
                }
              });
            });
            if (dataClassificationsToCopy.length > 0) {
              this.codeSchemeForm.patchValue({ dataClassifications: dataClassificationsToCopy });
            }
          });
          this.dataService.getLanguageCodes(this.languageService.language).subscribe(next3 => {
            const allLanguageCodes = next3;
            const languageCodesToCopy: CodePlain[] = [];
            originalCodeScheme.languageCodes.forEach(function (originalLanguageCode) {
              allLanguageCodes.forEach(function (potentialLanguageCode) {
                if (originalLanguageCode.codeValue === potentialLanguageCode.codeValue) {
                  languageCodesToCopy.push(potentialLanguageCode);
                }
              });
            });
            if (languageCodesToCopy.length > 0) {
              this.codeSchemeForm.patchValue({ languageCodes: languageCodesToCopy });
            }
          });
          this.locationService.atCreateNewVersionOfCodeSchemePage(originalCodeScheme);
        });
        this.pageTitle = 'Create a new version';
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

  setDefaultLanguageCodes() {
    const defaultLanguageCodes: CodePlain[] = this.allLanguageCodes.filter(languageCode =>
      codeValueMatches('fi', languageCode) ||
      codeValueMatches('sv', languageCode) ||
      codeValueMatches('en', languageCode)
    );
    this.codeSchemeForm.patchValue({ languageCodes: defaultLanguageCodes });

    function codeValueMatches(languageCode: string, code: CodePlain) {
      return code.codeValue === languageCode;
    }
  }

  get showUnfinishedFeature() {
    return this.env === 'dev' || this.env === 'local';
  }

  get loading(): boolean {
    return !this.codeRegistriesLoaded || !this.env || !this.allLanguageCodes;
  }

  back() {
    this.location.back();
  }

  save(formData: any): Observable<any> {

    const { validity, codeRegistry, defaultCode, dataClassifications, languageCodes, externalReferences, organizations, ...rest } = formData;

    const codeScheme: CodeSchemeType = <CodeSchemeType> {
      ...rest,
      startDate: formatDate(validity.start),
      endDate: formatDate(validity.end),
      codeRegistry: codeRegistry.serialize(),
      defaultCode: defaultCode ? defaultCode.serialize() : undefined,
      infoDomains: dataClassifications.map((dc: CodePlain) => dc.serialize()),
      languageCodes: languageCodes.map((lc: CodePlain) => lc.serialize()),
      externalReferences: externalReferences.map((er: ExternalReference) => er.serialize()),
      organizations: organizations.map((organization: Organization) => organization.serialize())
    };

    if (this.cloning) {
      console.log('Cloning CodeScheme');
      return this.dataService.cloneCodeScheme(codeScheme, codeRegistry.codeValue, this.uuidOfOriginalCodeSchemeIfCloning)
        .pipe(tap(createdCodeScheme => {
          console.log('Saved cloned CodeScheme');
          this.router.navigate([
            'codescheme',
            {
              registryCode: codeRegistry.codeValue,
              schemeCode: codeScheme.codeValue
            }
          ]);
        }));
    } else {
      const save = () => {
        console.log('Saving new CodeScheme');
        return this.dataService.createCodeScheme(codeScheme, codeRegistry.codeValue)
          .pipe(tap(createdCodeScheme => {
            console.log('Saved new CodeScheme');
            this.router.navigate(createdCodeScheme.route);
          }));
      };

      if (contains(restrictedStatuses, codeScheme.status)) {
        return from(this.confirmationModalService.openChooseToRestrictedStatus()).pipe(flatMap(save));
      } else {
        return save();
      }
    }
  }

  isCodeValuePatternValid(control: AbstractControl) {
    const isCodeValueValid = control.value.match(/^[a-zA-Z0-9_\-]*$/);
    return !isCodeValueValid ? { 'codeValueValidationError': { value: control.value } } : null;
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
        .pipe(map(exists => exists ? validationError : null));
    };
  }

  openTerminologyModal() {
    this.terminologyIntegrationModalService.open(false, 'codescheme').then(concept => this.putConceptStuffInPlace(concept), ignoreModalClose);
  }

  removeConceptUriInVocabularies() {
    this.codeSchemeForm.controls['conceptUriInVocabularies'].setValue('');
  }

  putConceptStuffInPlace(concept: Concept) {
    this.codeSchemeForm.patchValue({ prefLabel: concept.prefLabel });
    this.codeSchemeForm.patchValue({ definition: concept.definition });
    this.codeSchemeForm.patchValue({ conceptUriInVocabularies: concept.uri });
  }
}
