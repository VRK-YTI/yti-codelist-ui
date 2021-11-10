import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { EditableService } from '../../services/editable.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { LanguageService } from '../../services/language.service';
import { DataService } from '../../services/data.service';
import { CodeListConfirmationModalService } from '../common/confirmation-modal.service';
import { Member } from '../../entities/member';
import { Extension } from '../../entities/extension';
import { LocationService } from '../../services/location.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CodeScheme } from '../../entities/code-scheme';
import { validDateRange } from '../../utils/date';
import { Code } from '../../entities/code';
import { MemberValue } from '../../entities/member-value';
import { ValueType } from '../../entities/value-type';
import { ConfigurationService } from '../../services/configuration.service';
import { UserSimple } from '../../entities/user-simple';
import { AuthorizationManager } from '../../services/authorization-manager.service';
import { comparingLocalizable, UserService } from '@vrk-yti/yti-common-ui';

@Component({
  selector: 'app-member-information',
  templateUrl: './member-information.component.html',
  styleUrls: ['./member-information.component.scss']
})
export class MemberInformationComponent implements OnInit, OnChanges, OnDestroy {

  @Input() member: Member;

  extension: Extension;

  cancelSubscription: Subscription;

  memberForm = new FormGroup({
    prefLabel: new FormControl({}),
    unaryOperator: new FormControl('', [this.isUnaryOperatorPatternValid.bind(this)]),
    comparisonOperator: new FormControl('', [this.isComparisonOperatorPatternValid.bind(this)]),
    dpmDomainDataType: new FormControl(''),
    dpmMetricDataType: new FormControl(''),
    dpmDomainReference: new FormControl(''),
    dpmHierarchyReference: new FormControl(''),
    dpmBalanceType: new FormControl(''),
    dpmFlowType: new FormControl(''),
    dpmMemberXBRLCodePrefix: new FormControl(''),
    code: new FormControl(null, Validators.required),
    relatedMember: new FormControl(null),
    validity: new FormControl(null, validDateRange)
  });

  user$ = new BehaviorSubject<UserSimple | null>(null);

  constructor(public languageService: LanguageService,
              private authorizationManager: AuthorizationManager,
              private route: ActivatedRoute,
              private router: Router,
              private locationService: LocationService,
              private dataService: DataService,
              private userService: UserService,
              private confirmationModalService: CodeListConfirmationModalService,
              private editableService: EditableService,
              private configurationService: ConfigurationService) {

    this.cancelSubscription = editableService.cancel$.subscribe(() => this.reset());
  }

  ngOnInit() {

    const registryCodeValue = this.route.snapshot.params.registryCode;
    const schemeCodeValue = this.route.snapshot.params.schemeCode;
    const extensionCodeValue = this.route.snapshot.params.extensionCode;
    const memberId = this.route.snapshot.params.memberId;

    if (!memberId || !registryCodeValue || !schemeCodeValue || !extensionCodeValue) {
      throw new Error(`Illegal route, memberId: '${memberId}', registry: '${registryCodeValue}', ` +
        `scheme: '${schemeCodeValue}', extension: '${extensionCodeValue}'`);
    }

    this.dataService.getMember(memberId, extensionCodeValue).subscribe(member => {
      this.member = member;
      this.fetchUserInformation();
      this.locationService.atMemberPage(member);
    });

    this.dataService.getExtension(registryCodeValue, schemeCodeValue, extensionCodeValue).subscribe(extension => {
      this.extension = extension;
    });
  }

  fetchUserInformation() {

    if (!this.authorizationManager.user.anonymous) {
      this.dataService.findUserForMember(this.member.id).subscribe(user => {
        this.user = user;
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {

    this.fetchUserInformation();
    this.reset();
  }

  getValueFromMemberValues(memberValues: MemberValue[], localName: string): string | undefined {

    let value: string | undefined;
    memberValues.forEach(memberValue => {
      if (memberValue.valueType.localName === localName) {
        value = memberValue.value;
      }
    });
    return value;
  }

  reset() {

    const { startDate, endDate, memberValues, ...rest } = this.member;

    const unaryOperator: string | undefined = this.getValueFromMemberValues(memberValues, 'unaryOperator');
    const comparisonOperator: string | undefined = this.getValueFromMemberValues(memberValues, 'comparisonOperator');
    const dpmDomainDataType: string | undefined = this.getValueFromMemberValues(memberValues, 'dpmDomainDataType');
    const dpmMetricDataType: string | undefined = this.getValueFromMemberValues(memberValues, 'dpmMetricDataType');
    const dpmDomainReference: string | undefined = this.getValueFromMemberValues(memberValues, 'dpmDomainReference');
    const dpmHierarchyReference: string | undefined = this.getValueFromMemberValues(memberValues, 'dpmHierarchyReference');
    const dpmBalanceType: string | undefined = this.getValueFromMemberValues(memberValues, 'dpmBalanceType');
    const dpmFlowType: string | undefined = this.getValueFromMemberValues(memberValues, 'dpmFlowType');
    const dpmMemberXBRLCodePrefix: string | undefined = this.getValueFromMemberValues(memberValues, 'dpmMemberXBRLCodePrefix');

    this.memberForm.reset({
      ...rest,
      unaryOperator: unaryOperator,
      comparisonOperator: comparisonOperator,
      dpmDomainDataType: dpmDomainDataType,
      dpmMetricDataType: dpmMetricDataType,
      dpmDomainReference: dpmDomainReference,
      dpmHierarchyReference: dpmHierarchyReference,
      dpmBalanceType: dpmBalanceType,
      dpmFlowType: dpmFlowType,
      dpmMemberXBRLCodePrefix: dpmMemberXBRLCodePrefix,
      validity: { start: startDate, end: endDate }
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
    return this.member.extension.restricted;
  }

  ngOnDestroy() {

    this.cancelSubscription.unsubscribe();
  }

  get loading(): boolean {

    return this.extension == null || this.member == null;
  }

  canSave() {

    return this.memberForm.valid;
  }

  get allCodeSchemes(): CodeScheme[] {

    return [this.extension.parentCodeScheme, ...this.extension.codeSchemes];
  }

  get showCodeDetailLabel(): boolean {

    const code: Code = this.memberForm.controls['code'].value;
    if (code) {
      return code.codeScheme.id !== this.extension.parentCodeScheme.id;
    }
    return false;
  }

  getCodeUri(): string | null {

    const code: Code = this.memberForm.controls['code'].value;
    if (code) {
      return this.configurationService.getUriWithEnv(code.uri);
    }
    return null;
  }

  getCodeConceptUri(): string | null {

    const code: Code = this.memberForm.controls['code'].value;
    if (code) {
      const conceptUri: string = code.conceptUriInVocabularies;
      if (conceptUri) {
        return this.configurationService.getUriWithEnv(conceptUri);
      }
    }
    return null;
  }

  getMemberUri() {

    return this.configurationService.getUriWithEnv(this.member.uri);
  }

  isUnaryOperatorPatternValid(control: AbstractControl) {

    if (!this.loading) {
      const valueType: ValueType | null = this.extension.propertyType.valueTypeForLocalName('unaryOperator');
      if (valueType && valueType.regexp && control.value != null && control.value.length > 0) {
        const isMemberValueValid = control.value.match(valueType.regexp);
        return !isMemberValueValid ? { 'memberValueUnaryOperatorRegexpValidationError': { value: control.value } } : null;
      }
      return null;
    }
    return null;
  }

  isComparisonOperatorPatternValid(control: AbstractControl) {

    if (!this.loading) {
      const valueType: ValueType | null = this.extension.propertyType.valueTypeForLocalName('comparisonOperator');
      if (valueType && valueType.regexp && control.value != null && control.value.length > 0) {
        const isMemberValueValid = control.value.match(valueType.regexp);
        return !isMemberValueValid ? { 'memberValueComparisonOperatorRegexpValidationError': { value: control.value } } : null;
      }
      return null;
    }
    return null;
  }

  get isCodeExtension(): boolean {

    return this.extension.propertyType.context === 'CodeExtension';
  }

  get valueTypes(): ValueType[] {

    return this.extension.propertyType.valueTypes.sort(comparingLocalizable<ValueType>(this.languageService, item =>
      item.prefLabel ? item.prefLabel : {}));
  }

  currentExtensionIsACrossReferenceList(): boolean {

    return this.extension.propertyType.localName === 'crossReferenceList';
  }

  get labelForTheHiearchicalBroaderCodeChoice(): string {

    if (this.currentExtensionIsACrossReferenceList()) {
      return 'Cross-reference code';
    } else {
      return 'Broader member';
    }
  }

  get infoTextForHierarchicalParentInfoButtonBased(): string {

    if (this.extension.propertyType.localName === 'crossReferenceList') {
      return 'INFO_TEXT_CHOOSE_OTHER_SIDE_OF_CROSS_REFERENCE';
    } else {
      return 'INFO_TEXT_CHOOSE_HIERARCHICAL_PARENT_MEMBER';
    }
  }

  get user(): UserSimple | null {

    return this.user$.getValue();
  }

  set user(value: UserSimple | null) {

    this.user$.next(value);
  }
}
