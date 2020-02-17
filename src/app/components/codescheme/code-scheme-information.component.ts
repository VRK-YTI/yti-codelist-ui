import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { CodeScheme } from '../../entities/code-scheme';
import { FormControl, FormGroup } from '@angular/forms';
import { BehaviorSubject, Subscription } from 'rxjs';
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
import { UserSimple } from '../../entities/user-simple';
import { AuthorizationManager } from '../../services/authorization-manager.service';

@Component({
  selector: 'app-code-scheme-information',
  templateUrl: './code-scheme-information.component.html'
})
export class CodeSchemeInformationComponent implements OnChanges, OnDestroy, OnInit {

  @Input() codeScheme: CodeScheme;
  @Input() languageCodes: CodePlain[];
  @Input() codesOfTheCodeScheme: Code[];
  @Output() changeLanguage = new EventEmitter<CodePlain[]>();
  @Output() changeCodeStatusesAsWell = new EventEmitter<boolean>();

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
    changeCodeStatuses: new FormControl(false),
    feedbackChannel: new FormControl(),
  });

  user$ = new BehaviorSubject<UserSimple | null>(null);

  cancelSubscription: Subscription;
  languageChangeSubscription: Subscription;

  statusChanged = false;
  changeCodeStatusesToo = false;
  freeSuperUserFromStatusTransitionRules = true;

  constructor(public languageService: LanguageService,
              private authorizationManager: AuthorizationManager,
              private userService: UserService,
              private dataService: DataService,
              private confirmationModalService: CodeListConfirmationModalService,
              private editableService: EditableService,
              private terminologyIntegrationModalService: TerminologyIntegrationModalService,
              private configurationService: ConfigurationService) {
    this.cancelSubscription = editableService.cancel$.subscribe(() => this.reset());

    this.languageChangeSubscription = this.codeSchemeForm.controls['languageCodes'].valueChanges
      .subscribe(data => this.updateLanguages(data));
  }

  ngOnInit() {

    this.fetchUserInformation();

    this.codeSchemeForm.valueChanges.subscribe(next => {
        const newStatus = next['status'];
        const newChangeCodeStatuses = next['changeCodeStatuses'];

        this.statusChanged = newStatus && newStatus !== this.codeScheme.status;

        if (this.statusChanged && newChangeCodeStatuses === true) {
          this.changeCodeStatusesAsWell.emit(true);
        } else {
          this.changeCodeStatusesAsWell.emit(false);
        }
      }
    );
  }

  ngOnChanges(changes: SimpleChanges): void {

    this.fetchUserInformation();
    this.reset();
  }

  fetchUserInformation() {

    if (!this.authorizationManager.user.anonymous) {
      this.dataService.findUserForCodeScheme(this.codeScheme.id).subscribe(user => {
        this.user = user;
      });
    }
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

    const { externalReferences, infoDomains, defaultCode, startDate, endDate, organizations, languageCodes, ...rest } = this.codeScheme;

    this.languageCodes = languageCodes; // needed to to get all langs showing properly again after a CANCEL click

    infoDomains.sort(comparingLocalizable<Code>(this.languageService, infoDomain => infoDomain.prefLabel));

    this.codeSchemeForm.reset({
      ...rest,
      languageCodes : this.languageCodes,
      externalReferences: externalReferences.map(link => link.clone()),
      infoDomains: infoDomains.map(infoDomain => infoDomain.clone()),
      defaultCode: defaultCode,
      validity: { start: startDate, end: endDate },
      organizations: organizations.map(organization => organization.clone()),
      changeCodeStatuses: false
    });

    this.statusChanged = false;
    this.changeCodeStatusesToo = false;
    this.freeSuperUserFromStatusTransitionRules = true;
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
        this.codeSchemeForm.controls['prefLabel'].setValue(concept.prefLabel);
        this.codeSchemeForm.controls['definition'].setValue(concept.definition);
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

  toggleChangeCodeStatusesToo() {

    this.changeCodeStatusesToo = !this.changeCodeStatusesToo;
    this.codeSchemeForm.patchValue({ changeCodeStatuses: !this.codeSchemeForm.controls['changeCodeStatuses'].value });
  }

  showChangeCodeStatusesCheckbox(): boolean {

    return this.editing && this.statusChanged && this.codesOfTheCodeScheme.length > 0;
  }

  get user(): UserSimple | null {

    return this.user$.getValue();
  }

  set user(value: UserSimple | null) {

    this.user$.next(value);
  }

  toggleEnforceTransitionRulesForSuperUserToo() {
    this.freeSuperUserFromStatusTransitionRules = !this.freeSuperUserFromStatusTransitionRules;
  }

  handleLanguageCodesChangedEvent(updatedLanguageCodes: CodePlain[]) {
    this.languageCodes = updatedLanguageCodes;
  }
}
