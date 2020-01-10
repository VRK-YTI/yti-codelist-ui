import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { Code } from '../../entities/code';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { EditableService } from '../../services/editable.service';
import { BehaviorSubject, Subscription } from 'rxjs';
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
import { Extension } from '../../entities/extension';
import { MemberSimple } from '../../entities/member-simple';
import { CodePlain } from '../../entities/code-simple';
import { CodePlainType } from '../../services/api-schema';
import { ValueType } from '../../entities/value-type';
import { MemberValueValidators } from '../form/member-value-validators';
import { UserSimple } from '../../entities/user-simple';
import { AuthorizationManager } from '../../services/authorization-manager.service';

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
    codeExtensions: new FormArray([]),
    conceptUriInVocabularies: new FormControl(''),
    subCodeScheme: new FormControl(null)
  });

  user$ = new BehaviorSubject<UserSimple | null>(null);
  freeSuperUserFromStatusTransitionRules = true;

  constructor(public languageService: LanguageService,
              private authorizationManager: AuthorizationManager,
              private dataService: DataService,
              private userService: UserService,
              private confirmationModalService: CodeListConfirmationModalService,
              private editableService: EditableService,
              private terminologyIntegrationModalService: TerminologyIntegrationModalService,
              private configurationService: ConfigurationService) {

    this.cancelSubscription = editableService.cancel$.subscribe(() => this.reset());
  }

  ngOnChanges(changes: SimpleChanges): void {

    this.fetchUserInformation();
    this.reset();
  }

  fetchUserInformation() {

    if (!this.authorizationManager.user.anonymous) {
      this.dataService.findUserForCode(this.code.id).subscribe(user => {
        this.user = user;
      });
    }
  }

  reset() {

    const { externalReferences, codeExtensions, startDate, endDate, ...rest } = this.code;

    this.codeForm.reset({
      ...rest,
      validity: { start: startDate, end: endDate },
      externalReferences: externalReferences.map(link => link.clone()),
    });

    this.initCodeExtensions();

    this.freeSuperUserFromStatusTransitionRules = true;
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

  get codeExtensionsFormArray(): FormArray {

    return this.codeForm.get('codeExtensions') as FormArray;
  }

  get codeExtensions(): ExtensionSimple[] {

    return this.codeScheme.extensions.filter(extension => extension.propertyType.context === 'CodeExtension').sort(comparingLocalizable<ExtensionSimple>(this.languageService, item =>
      item.prefLabel ? item.prefLabel : {}));
  }

  getExtensionDisplayName(extensionId: string): string {

    const extension: Extension | null = this.getExtension(extensionId);
    if (extension) {
      return extension.getDisplayName(this.languageService);
    }
    return '';
  }

  getExtension(extensionId: string): Extension | null {

    for (const extension of this.code.codeExtensions) {
      if (extension.id === extensionId) {
        return extension;
      }
    }
    return null;
  }

  initCodeExtensions() {

    this.codeExtensionsFormArray.controls = [];
    if (this.code.codeExtensions) {
      this.code.codeExtensions.forEach(codeExtension => {
        this.codeExtensionsFormArray.push(this.initExtension(codeExtension));
      });
    }
  }

  initExtension(extension: Extension): FormGroup {

    return new FormGroup({
      id: new FormControl(extension.id),
      uri: new FormControl(extension.uri),
      url: new FormControl(extension.url),
      codeValue: new FormControl(extension.codeValue),
      status: new FormControl(extension.status),
      prefLabel: new FormControl(extension.prefLabel),
      propertyType: new FormControl(extension.propertyType),
      members: this.initMembers(extension)
    })
  }

  initMembers(extension: Extension): FormArray {

    const membersArray: FormArray = new FormArray([]);
    membersArray.push(this.initMember(extension));
    return membersArray;
  }

  initMember(extension: Extension): FormGroup {

    const codePlainType: CodePlainType = this.code.serializeToPlainType();
    const codePlain: CodePlain = new CodePlain(codePlainType);
    const member: MemberSimple | null = this.getMemberForExtension(extension);
    return new FormGroup({
      id: new FormControl(member ? member.id : null),
      url: new FormControl(member ? member.url : null),
      uri: new FormControl(member ? member.uri : null),
      startDate: new FormControl(member ? member.startDate : null),
      endDate: new FormControl(member ? member.endDate : null),
      code: new FormControl(codePlain),
      memberValues: this.initMemberValues(extension)
    });
  }

  initMemberValues(extension: Extension): FormArray {

    const memberValuesFormArray: FormArray = new FormArray([]);
    const valueTypes: ValueType[] = extension.propertyType.valueTypes.sort(comparingLocalizable<ValueType>(this.languageService, item => item.prefLabel ? item.prefLabel : {}));
    if (valueTypes) {
      valueTypes.forEach(valueType => {
        const existingMemberValue: MemberValue | null = this.getMemberValueForValueType(extension, valueType.localName);
        const memberValueGroup: FormGroup = new FormGroup({
          valueType: new FormControl(valueType),
          value: new FormControl(existingMemberValue ? existingMemberValue.value : '', MemberValueValidators.validateMemberValueAgainstRegexpAndRequired(valueType))
        });
        memberValuesFormArray.push(memberValueGroup);
      })
    }
    return memberValuesFormArray;
  }

  getMemberForExtension(extension: Extension): MemberSimple | null {

    for (const codeExtension of this.code.codeExtensions) {
      if (codeExtension.id === extension.id) {
        if (codeExtension.members && codeExtension.members.length > 0) {
          return codeExtension.members[0];
        }
      }
    }
    return null;
  }

  getMemberValueForValueType(extension: Extension,
                             valueTypeLocalName: string): MemberValue | null {

    for (const codeExtension of this.code.codeExtensions) {
      if (codeExtension.id === extension.id) {
        if (codeExtension.members && codeExtension.members.length > 0) {
          const member: MemberSimple = codeExtension.members[0];
          if (member.memberValues && member.memberValues.length > 0) {
            for (const memberValue of member.memberValues) {
              if (memberValue.valueType.localName === valueTypeLocalName) {
                return memberValue;
              }
            }
          }
        }
      }
    }
    return null;
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
}
