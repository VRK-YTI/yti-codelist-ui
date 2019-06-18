import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { CodeScheme } from '../../entities/code-scheme';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { EditableService } from '../../services/editable.service';
import { CodeListConfirmationModalService } from '../common/confirmation-modal.service';
import { Code } from '../../entities/code';
import { LanguageService } from '../../services/language.service';
import { requiredList } from 'yti-common-ui/utils/validator';
import { validDateRange } from '../../utils/date';
import { UserService } from 'yti-common-ui/services/user.service';
import { DataService } from '../../services/data.service';
import { ignoreModalClose } from 'yti-common-ui/utils/modal';
import { TerminologyIntegrationModalService } from '../terminology-integration/terminology-integration-codescheme-modal.component';
import { Concept } from '../../entities/concept';
import { comparingLocalizable } from 'yti-common-ui/utils/comparator';
import { CodePlain } from '../../entities/code-simple';
import { ConfigurationService } from '../../services/configuration.service';
import { nonEmptyLocalizableValidator } from '../../utils/validators';

@Component({
  selector: 'app-code-scheme-information',
  templateUrl: './code-scheme-information.component.html'
})
export class CodeSchemeInformationComponent implements OnChanges, OnDestroy {

  @Input() codeScheme: CodeScheme;
  @Input() languageCodes: CodePlain[];
  @Output() changeLanguage = new EventEmitter<CodePlain[]>();

  previousCodeScheme: CodeScheme;
  codelistMarkedAsCumulative: boolean;

  codeSchemeForm = new FormGroup({
    prefLabel: new FormControl({}, nonEmptyLocalizableValidator),
    description: new FormControl({}),
    changeNote: new FormControl({}),
    definition: new FormControl({}),
    version: new FormControl(''),
    source: new FormControl(''),
    legalBase: new FormControl(''),
    governancePolicy: new FormControl(''),
    externalReferences: new FormControl(),
    infoDomains: new FormControl([], [requiredList]),
    languageCodes: new FormControl([], [requiredList]),
    defaultCode: new FormControl(null),
    validity: new FormControl(null, validDateRange),
    status: new FormControl(),
    conceptUriInVocabularies: new FormControl(''),
    organizations: new FormControl([], [requiredList]),
    cumulative: new FormControl(),
    changeCodeStatuses: new FormControl(true)
  });

  cancelSubscription: Subscription;
  languageChangeSubscription: Subscription;

  constructor(private userService: UserService,
              private dataService: DataService,
              private confirmationModalService: CodeListConfirmationModalService,
              private editableService: EditableService,
              public languageService: LanguageService,
              private terminologyIntegrationModalService: TerminologyIntegrationModalService,
              private configurationService: ConfigurationService) {
    this.cancelSubscription = editableService.cancel$.subscribe(() => this.reset());

    this.languageChangeSubscription = this.codeSchemeForm.controls['languageCodes'].valueChanges
      .subscribe(data => this.updateLanguages(data));
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.reset();
  }

  updateLanguages(codes: CodePlain[]) {
    this.changeLanguage.emit(codes);
  }

  private reset() {

    if (this.codeScheme.prevCodeschemeId) {
      this.dataService.getCodeSchemeWithUuid(this.codeScheme.prevCodeschemeId).subscribe(next => {
        this.previousCodeScheme = next;
      })
    }

    const { externalReferences, infoDomains, defaultCode, startDate, endDate, organizations, ...rest } = this.codeScheme;

    infoDomains.sort(comparingLocalizable<Code>(this.languageService, infoDomain => infoDomain.prefLabel));

    this.codeSchemeForm.reset({
      ...rest,
      externalReferences: externalReferences.map(link => link.clone()),
      infoDomains: infoDomains.map(infoDomain => infoDomain.clone()),
      defaultCode: defaultCode,
      validity: { start: startDate, end: endDate },
      organizations: organizations.map(organization => organization.clone())
    });
  }

  ngOnDestroy() {
    this.cancelSubscription.unsubscribe();
    this.languageChangeSubscription.unsubscribe();
  }

  get editing() {
    return this.editableService.editing;
  }

  get isSuperUser() {
    return this.userService.user.superuser;
  }

  get restricted(): boolean {
    if (this.isSuperUser) {
      return false;
    }
    return this.codeScheme.restricted;
  }

  removeConceptUriInVocabularies() {
    this.codeScheme.conceptUriInVocabularies = '';
    this.codeSchemeForm.controls['conceptUriInVocabularies'].setValue('');
  }

  openTerminologyModal() {
    this.terminologyIntegrationModalService.open(true, 'codescheme')
      .then(concept => this.putConceptStuffInPlace(concept), ignoreModalClose);
  }

  putConceptStuffInPlace(concept: Concept) {

    this.confirmationModalService.openOverWriteExistingValuesFromVocabularies()
      .then(() => {
        this.codeSchemeForm.patchValue({ prefLabel: concept.prefLabel });
        this.codeSchemeForm.patchValue({ definition: concept.definition });
      }, ignoreModalClose);
    this.codeScheme.conceptUriInVocabularies = concept.uri;
    this.codeSchemeForm.patchValue({ conceptUriInVocabularies: concept.uri });
  }

  getCodeSchemeUri() {
    return this.configurationService.getUriWithEnv(this.codeScheme.uri);
  }

  getConceptUri() {
    const conceptUri = this.codeScheme.conceptUriInVocabularies;
    if (conceptUri != null && conceptUri.length > 0) {
      return this.configurationService.getUriWithEnv(conceptUri);
    }
    return null;
  }

  toggleMarkCodelistAsCumulative() {
    this.codelistMarkedAsCumulative = !this.codelistMarkedAsCumulative;
    this.codeSchemeForm.patchValue({ cumulative: this.codelistMarkedAsCumulative });
  }

  getCodeRegistryName(): string {
    return !this.languageService.isLocalizableEmpty(this.codeScheme.codeRegistry.prefLabel) ?
      this.languageService.translate(this.codeScheme.codeRegistry.prefLabel, false) : this.codeScheme.codeRegistry.codeValue
  }
}
