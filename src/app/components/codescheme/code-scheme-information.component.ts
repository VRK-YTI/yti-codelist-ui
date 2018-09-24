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

@Component({
  selector: 'app-code-scheme-information',
  templateUrl: './code-scheme-information.component.html',
  styleUrls: ['./code-scheme-information.component.scss']
})
export class CodeSchemeInformationComponent implements OnChanges, OnDestroy {

  @Input() codeScheme: CodeScheme;
  @Input() languageCodes: CodePlain[];
  @Output() change = new EventEmitter<CodePlain[]>();

  dataClassifications: Code[];
  env: string;

  codeSchemeForm = new FormGroup({
    prefLabel: new FormControl({}),
    description: new FormControl({}),
    changeNote: new FormControl({}),
    definition: new FormControl({}),
    version: new FormControl(''),
    source: new FormControl(''),
    legalBase: new FormControl(''),
    governancePolicy: new FormControl(''),
    externalReferences: new FormControl(),
    dataClassifications: new FormControl([], [requiredList]),
    languageCodes: new FormControl([], [requiredList]),
    defaultCode: new FormControl(null),
    validity: new FormControl(null, validDateRange),
    status: new FormControl(),
    conceptUriInVocabularies: new FormControl(''),
    organizations: new FormControl([], [requiredList])
  });

  cancelSubscription: Subscription;
  languageChangeSubscription: Subscription;

  constructor(private userService: UserService,
              private dataService: DataService,
              private confirmationModalService: CodeListConfirmationModalService,
              private editableService: EditableService,
              public languageService: LanguageService,
              private terminologyIntegrationModalService: TerminologyIntegrationModalService) {

    this.cancelSubscription = editableService.cancel$.subscribe(() => this.reset());

    this.languageChangeSubscription = this.codeSchemeForm.controls['languageCodes'].valueChanges
      .subscribe(data => this.updateLanguages(data));

    dataService.getServiceConfiguration().subscribe(configuration => {
      this.env = configuration.env;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.reset();
  }

  updateLanguages(codes: CodePlain[]) {
    this.change.emit(codes);
  }

  private reset() {
    const { externalReferences, dataClassifications, defaultCode, startDate, endDate, organizations, ...rest } = this.codeScheme;

    dataClassifications.sort(comparingLocalizable<Code>(this.languageService, classification => classification.prefLabel));

    this.codeSchemeForm.reset({
      ...rest,
      externalReferences: externalReferences.map(link => link.clone()),
      dataClassifications: dataClassifications.map(classification => classification.clone()),
      defaultCode: defaultCode,
      validity: { start: startDate, end: endDate },
      organizations: organizations.map(organization => organization.clone())
    });
  }

  ngOnDestroy() {
    this.cancelSubscription.unsubscribe();
    this.languageChangeSubscription.unsubscribe();
  }

  get showUnfinishedFeature() {
    return this.env === 'dev' || this.env === 'local';
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
    if (this.env !== 'prod') {
      return this.codeScheme.uri + '?env=' + this.env;
    }
    return this.codeScheme.uri;
  }

  getConceptUri() {
    const conceptUri = this.codeScheme.conceptUriInVocabularies;
    if (conceptUri != null && conceptUri.length > 0) {
      if (this.env !== 'prod') {
        return conceptUri + '?env=' + this.env;
      }
      return conceptUri;
    }
    return null;
  }
}
