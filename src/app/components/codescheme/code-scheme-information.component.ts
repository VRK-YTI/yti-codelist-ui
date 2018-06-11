import { Component, Input, OnChanges, OnDestroy, SimpleChanges, OnInit} from '@angular/core';
import { CodeScheme } from '../../entities/code-scheme';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { EditableService } from '../../services/editable.service';
import { LinkListModalService } from './link-list-modal.component';
import { LinkShowModalService } from './link-show-modal.component';
import { LinkEditModalService } from './link-edit-modal.component';
import { CodeListConfirmationModalService } from '../common/confirmation-modal.service';
import { Code } from '../../entities/code';
import { LanguageService } from '../../services/language.service';
import { requiredList } from 'yti-common-ui/utils/validator';
import { validDateRange } from '../../utils/date';
import { UserService } from 'yti-common-ui/services/user.service';
import { DataService } from '../../services/data.service';
import { ignoreModalClose } from 'yti-common-ui/utils/modal';
import { Router } from '@angular/router';
import { CodeListErrorModalService } from '../common/error-modal.service';
import { TerminologyIntegrationModalService} from '../terminology-integration/terminology-integration-codescheme-modal.component';
import {Concept} from '../../entities/concept';
import {hasLocalization} from 'yti-common-ui/utils/localization';
import { CodePlain } from '../../entities/code-simple';


@Component({
  selector: 'app-code-scheme-information',
  templateUrl: './code-scheme-information.component.html',
  styleUrls: ['./code-scheme-information.component.scss']
})
export class CodeSchemeInformationComponent implements OnChanges, OnDestroy, OnInit {

  @Input() codeScheme: CodeScheme;

  dataClassifications: Code[];
  defaultCode: CodePlain;
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
    defaultCode: new FormControl(null),
    validity: new FormControl(null, validDateRange),
    status: new FormControl(),
    conceptUriInVocabularies: new FormControl('')
  });

  cancelSubscription: Subscription;

  constructor(private userService: UserService,
              private dataService: DataService,
              private router: Router,
              private errorModalService: CodeListErrorModalService,
              private linkEditModalService: LinkEditModalService,
              private linkShowModalService: LinkShowModalService,
              private linkListModalService: LinkListModalService,
              private confirmationModalService: CodeListConfirmationModalService,
              private editableService: EditableService,
              public languageService: LanguageService,
              private terminologyIntegrationModalService: TerminologyIntegrationModalService) {

    this.cancelSubscription = editableService.cancel$.subscribe(() => this.reset());

    dataService.getServiceConfiguration().subscribe(configuration => {
      this.env = configuration.env;
    });
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.reset();
  }

  private reset() {
    const { externalReferences, dataClassifications, defaultCode, startDate, endDate, ...rest } = this.codeScheme;

    this.codeSchemeForm.reset({
      ...rest,
      externalReferences: externalReferences.map(link => link.clone()),
      dataClassifications: dataClassifications.map(classification => classification.clone()),
      defaultCode: defaultCode,
      validity: { start: startDate, end: endDate }
    });
  }

  ngOnDestroy() {
    this.cancelSubscription.unsubscribe();
  }

  get isDev() {
    return this.env !== 'dev';
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
    this.terminologyIntegrationModalService.open(true).then(concept => this.putConceptStuffInPlace(concept), ignoreModalClose);
  }

  putConceptStuffInPlace(concept: Concept) {

    this.confirmationModalService.openOverWriteExistingValuesFromVocabularies()
      .then(() => {
        this.codeSchemeForm.patchValue({prefLabel: concept.prefLabel});
        this.codeSchemeForm.patchValue({definition: concept.definition});
      }, ignoreModalClose);
    this.codeScheme.conceptUriInVocabularies = concept.uri;
    this.codeSchemeForm.patchValue({conceptUriInVocabularies: concept.uri});
  }
}
