import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { Code } from '../../entities/code';
import { FormControl, FormGroup } from '@angular/forms';
import { EditableService } from '../../services/editable.service';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../services/language.service';
import { validDateRange } from '../../utils/date';
import { UserService } from 'yti-common-ui/services/user.service';
import { DataService } from '../../services/data.service';
import { ignoreModalClose } from 'yti-common-ui/utils/modal';
import { CodeListConfirmationModalService } from '../common/confirmation-modal.service';
import { TerminologyIntegrationModalService } from '../terminology-integration/terminology-integration-codescheme-modal.component';
import { Concept } from '../../entities/concept';
import { CodeScheme } from '../../entities/code-scheme';
import { ConfigurationService } from '../../services/configuration.service';
import { ExtensionSimple } from '../../entities/extension-simple';
import { MemberValue } from '../../entities/member-value';
import { comparingLocalizable } from 'yti-common-ui/utils/comparator';

@Component({
  selector: 'app-code-information',
  templateUrl: './code-information.component.html',
  styleUrls: ['./code-information.component.scss']
})
export class CodeInformationComponent implements OnChanges, OnDestroy {

  @Input() code: Code;
  @Input() codeScheme: CodeScheme;

  cancelSubscription: Subscription;

  codeForm = new FormGroup({
    prefLabel: new FormControl(''),
    description: new FormControl(''),
    definition: new FormControl(''),
    shortName: new FormControl(''),
    externalReferences: new FormControl(),
    broaderCode: new FormControl(null),
    validity: new FormControl(null, validDateRange),
    status: new FormControl(),
    codeExtensions: new FormControl(),
    conceptUriInVocabularies: new FormControl('')
  });

  constructor(private dataService: DataService,
              private userService: UserService,
              private confirmationModalService: CodeListConfirmationModalService,
              private editableService: EditableService,
              public languageService: LanguageService,
              private terminologyIntegrationModalService: TerminologyIntegrationModalService,
              private configurationService: ConfigurationService) {

    this.cancelSubscription = editableService.cancel$.subscribe(() => this.reset());
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.reset();
  }

  reset() {
    const { externalReferences, codeExtensions, startDate, endDate, ...rest } = this.code;

    this.codeForm.reset({
      ...rest,
      validity: { start: startDate, end: endDate },
      externalReferences: externalReferences.map(link => link.clone()),
      codeExtensions: codeExtensions.map(ie => ie.clone())
    });
  }

  get editing() {
    return this.editableService.editing;
  }

  get isSuperUser() {
    return this.userService.user.superuser;
  }

  get restricted() {
    if (this.isSuperUser) {
      return false;
    }
    return this.code.restricted;
  }

  get codeSchemes(): CodeScheme[] {
    const codeSchemes: CodeScheme[] = [];
    codeSchemes.push(this.code.codeScheme);
    return codeSchemes;
  }

  ngOnDestroy() {
    this.cancelSubscription.unsubscribe();
  }

  openTerminologyModal() {
    this.terminologyIntegrationModalService.open(true, 'code').then(concept => this.putConceptStuffInPlace(concept), ignoreModalClose);
  }

  removeConceptUriInVocabularies() {
    this.code.conceptUriInVocabularies = '';
    this.codeForm.controls['conceptUriInVocabularies'].setValue('');
  }

  putConceptStuffInPlace(concept: Concept) {
    this.confirmationModalService.openOverWriteExistingValuesFromVocabularies()
      .then(() => {
        this.codeForm.patchValue({ prefLabel: concept.prefLabel });
        this.codeForm.patchValue({ definition: concept.definition });
      }, ignoreModalClose);
    this.code.conceptUriInVocabularies = concept.uri;
    this.codeForm.patchValue({ conceptUriInVocabularies: concept.uri });
  }

  getCodeUri() {
    return this.configurationService.getUriWithEnv(this.code.uri);
  }

  getConceptUri() {
    const conceptUri = this.code.conceptUriInVocabularies;
    if (conceptUri != null && conceptUri.length > 0) {
      return this.configurationService.getUriWithEnv(conceptUri);
    }
    return null;
  }

  get codeExtensions(): ExtensionSimple[] {
    return this.codeScheme.extensions.filter(extension => extension.propertyType.context === 'CodeExtension').sort(comparingLocalizable<ExtensionSimple>(this.languageService, item =>
      item.prefLabel ? item.prefLabel : {}));
  }

  memberValuesForCodeExtension(type: string): MemberValue[] | null {
    if (this.code.codeExtensions) {
      for (const extension of this.code.codeExtensions) {
        if (extension.propertyType.localName === type) {
          if (extension.members && extension.members.length === 1) {
            return extension.members[0].memberValues;
          }
        }
      }
    }
    return null;
  }

  get hasCodeExtensions(): boolean {
    const extensions = this.codeExtensions;
    return extensions != null && extensions.length > 0;
  }
}
