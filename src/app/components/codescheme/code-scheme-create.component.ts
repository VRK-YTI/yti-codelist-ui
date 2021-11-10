import { Component, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup, Validators } from '@angular/forms';
import { EditableService } from '../../services/editable.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { formatDate, validDateRange } from '../../utils/date';
import { CodeSchemeType } from '../../services/api-schema';
import { from, Observable } from 'rxjs';
import { Concept } from '../../entities/concept';
import { TerminologyIntegrationModalService } from '../terminology-integration/terminology-integration-codescheme-modal.component';
import { CodePlain } from '../../entities/code-simple';
import { CodeScheme } from '../../entities/code-scheme';
import { Location } from '@angular/common';
import { LocationService } from '../../services/location.service';
import { ExternalReference } from '../../entities/external-reference';
import { LanguageService } from '../../services/language.service';
import { flatMap, map, tap } from 'rxjs/operators';
import { CodeListConfirmationModalService } from '../common/confirmation-modal.service';
import { Organization } from '../../entities/organization';
import { nonEmptyLocalizableValidator } from '../../utils/validators';
import { contains, ignoreModalClose, requiredList, restrictedStatuses, Status, UserService } from '@vrk-yti/yti-common-ui';

@Component({
  selector: 'app-code-scheme-create',
  templateUrl: './code-scheme-create.component.html',
  styleUrls: ['./code-scheme-create.component.scss'],
  providers: [EditableService]
})
export class CodeSchemeCreateComponent implements OnInit {

  codeRegistriesLoaded = false;
  uuidOfOriginalCodeSchemeIfCloning: string;
  pageTitle = 'Create code list';
  cloning = false;
  allLanguageCodes: CodePlain[];
  initialLanguageCodes: CodePlain[];
  originalCodeScheme: CodeScheme;

  codeSchemeForm = new FormGroup({
    newVersionEmpty: new FormControl('false', Validators.required),
    codeValue: new FormControl('', [Validators.required, this.isCodeValuePatternValid]),
    prefLabel: new FormControl({}, nonEmptyLocalizableValidator),
    description: new FormControl({}),
    definition: new FormControl({}),
    changeNote: new FormControl({}),
    version: new FormControl(''),
    source: new FormControl(''),
    legalBase: new FormControl(''),
    governancePolicy: new FormControl(''),
    externalReferences: new FormControl([]),
    validity: new FormControl({ start: null, end: null }, validDateRange),
    infoDomains: new FormControl([], [requiredList]),
    languageCodes: new FormControl([], [requiredList]),
    defaultCode: new FormControl(null),
    status: new FormControl('DRAFT' as Status),
    codeRegistry: new FormControl(null, Validators.required),
    conceptUriInVocabularies: new FormControl(''),
    organizations: new FormControl([], [requiredList]),
    cumulative: new FormControl(),
    feedbackChannel: new FormControl(),
  }, null, this.codeValueExistsValidator());

  constructor(private router: Router,
              private dataService: DataService,
              private editableService: EditableService,
              private terminologyIntegrationModalService: TerminologyIntegrationModalService,
              private activatedRoute: ActivatedRoute,
              private location: Location,
              private languageService: LanguageService,
              private locationService: LocationService,
              private confirmationModalService: CodeListConfirmationModalService,
              private userService: UserService) {

    editableService.onSave = (formValue: any) => this.save(formValue);
    editableService.cancel$.subscribe(() => this.back());
    this.editableService.edit();
  }

  ngOnInit() {

    this.dataService.getLanguageCodes(this.languageService.language).subscribe(languageCodes => {
      this.allLanguageCodes = languageCodes;

      this.activatedRoute.queryParams.subscribe(params => {
        this.uuidOfOriginalCodeSchemeIfCloning = params['originalCodeSchemeId'];
        if (this.uuidOfOriginalCodeSchemeIfCloning) {
          this.cloning = true;
          this.codeRegistriesLoaded = true; // when cloning, no registries are needed, need to fake loading is ready
          this.dataService.getCodeSchemeWithUuid(this.uuidOfOriginalCodeSchemeIfCloning).subscribe(next => {
            const originalCodeScheme: CodeScheme = next;
            this.originalCodeScheme = next;

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
            if (originalCodeScheme.cumulative === true) {
              this.codeSchemeForm.patchValue({ cumulative: true });
              this.codeSchemeForm.patchValue({ newVersionEmpty: false }); // when cloning a cumulative codelist, never allow empty. The choice is hidden in UI as well.
            } else {
              this.codeSchemeForm.patchValue({ cumulative: false });
            }
            this.codeSchemeForm.patchValue({ feedbackChannel: originalCodeScheme.feedbackChannel })
            this.dataService.getInfoDomainsAsCodes(this.languageService.language).subscribe(next2 => {
              const allInfoDomains = next2;
              const infoDomainsToCopy: CodePlain[] = [];
              originalCodeScheme.infoDomains.forEach(function (originalInfoDomain) {
                allInfoDomains.forEach(function (potentialInfoDomain) {
                  const uriToCompare = potentialInfoDomain.codeScheme.uri + '/code/' + potentialInfoDomain.codeValue;
                  if (uriToCompare === originalInfoDomain.uri) {
                    infoDomainsToCopy.push(potentialInfoDomain);
                  }
                });
              });
              if (infoDomainsToCopy.length > 0) {
                this.codeSchemeForm.patchValue({ infoDomains: infoDomainsToCopy });
              }
            });
            this.locationService.atCreateNewVersionOfCodeSchemePage(originalCodeScheme);
            this.setDefaultLanguageCodes(this.cloning, originalCodeScheme);
          });
          this.pageTitle = 'Create a new version';
        } else {
          this.locationService.atCodeSchemeCreatePage();
          this.setDefaultLanguageCodes(this.cloning, undefined);
        }
        if (!this.cloning) {
          setTimeout(() => {
            this.openTerminologyModal();
          });
        }
      });

    });
  }

  setDefaultLanguageCodes(cloning: boolean, originalCodeScheme?: CodeScheme) {
    let defaultLanguageCodes: CodePlain[];

    if (cloning) {
      defaultLanguageCodes = originalCodeScheme ? originalCodeScheme.languageCodes : [];
    } else {
      defaultLanguageCodes = this.allLanguageCodes.filter(languageCode =>
        codeValueMatches('fi', languageCode) ||
        codeValueMatches('sv', languageCode) ||
        codeValueMatches('en', languageCode)
      );
    }

    this.codeSchemeForm.patchValue({ languageCodes: defaultLanguageCodes });
    this.initialLanguageCodes = defaultLanguageCodes;

    function codeValueMatches(languageCode: string, code: CodePlain) {
      return code.codeValue === languageCode;
    }
  }

  get loading(): boolean {
    return !this.codeRegistriesLoaded || !this.allLanguageCodes;
  }

  back() {
    this.location.back();
  }

  save(formData: any): Observable<any> {

    const { newVersionEmpty, validity, codeRegistry, defaultCode, infoDomains, languageCodes, externalReferences, organizations, ...rest } = formData;

    const codeScheme: CodeSchemeType = <CodeSchemeType>{
      ...rest,
      startDate: formatDate(validity.start),
      endDate: formatDate(validity.end),
      codeRegistry: codeRegistry.serialize(),
      defaultCode: defaultCode ? defaultCode.serialize() : undefined,
      infoDomains: infoDomains.map((dc: CodePlain) => dc.serialize()),
      languageCodes: languageCodes.map((lc: CodePlain) => lc.serialize()),
      externalReferences: externalReferences.map((er: ExternalReference) => er.serialize()),
      organizations: organizations.map((organization: Organization) => organization.serialize())
    };

    if (this.cloning) {
      const save = () => {
        return this.dataService.cloneCodeScheme(codeScheme, codeRegistry.codeValue, this.uuidOfOriginalCodeSchemeIfCloning, newVersionEmpty)
          .pipe(tap(createdCodeScheme => {
            this.router.navigate([
              'codescheme',
              {
                registryCode: codeRegistry.codeValue,
                schemeCode: codeScheme.codeValue
              }
            ]);
          }));
      };

      if (this.codeSchemeForm.controls['newVersionEmpty'].value === 'true') {
        return from(this.confirmationModalService.openCreateNewCodeSchemeVersionAsEmpty()).pipe(flatMap(save));
      } else {
        return save();
      }
    } else {
      const save = () => {
        return this.dataService.createCodeScheme(codeScheme, codeRegistry.codeValue)
          .pipe(tap(createdCodeScheme => {
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
    this.codeSchemeForm.controls['prefLabel'].setValue(concept.prefLabel);
    this.codeSchemeForm.controls['definition'].setValue(concept.definition);
    this.codeSchemeForm.patchValue({ conceptUriInVocabularies: concept.uri });
  }

  get isSuperUser() {
    return this.userService.user.superuser;
  }

  handleLanguageCodesChangedEvent(updatedLanguageCodes: CodePlain[]) {
    this.initialLanguageCodes = updatedLanguageCodes;
  }
}
