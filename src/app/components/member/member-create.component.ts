import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { EditableService } from '../../services/editable.service';
import { DataService } from '../../services/data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Extension } from '../../entities/extension';
import { MemberType, MemberValueType } from '../../services/api-schema';
import { LanguageService } from '../../services/language.service';
import { LocationService } from '../../services/location.service';
import { CodeScheme } from '../../entities/code-scheme';
import { formatDate, validDateRange } from '../../utils/date';
import { tap } from 'rxjs/operators';
import { Code } from '../../entities/code';
import { MemberValue } from '../../entities/member-value';
import { ValueType } from '../../entities/value-type';
import { ConfigurationService } from '../../services/configuration.service';
import { comparingLocalizable } from 'yti-common-ui/utils/comparator';

@Component({
  selector: 'app-member-create',
  templateUrl: './member-create.component.html',
  styleUrls: ['./member-create.component.scss'],
  providers: [EditableService]
})
export class MemberCreateComponent implements OnInit {

  extension: Extension;

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
    validity: new FormControl({ start: null, end: null }, validDateRange)
  });

  constructor(private dataService: DataService,
              private route: ActivatedRoute,
              private router: Router,
              private editableService: EditableService,
              public languageService: LanguageService,
              private locationService: LocationService,
              private configurationService: ConfigurationService) {

    editableService.onSave = (formValue: any) => this.save(formValue);
    editableService.cancel$.subscribe(() => this.back());
    this.editableService.edit();
  }

  ngOnInit() {

    const registryCodeValue = this.route.snapshot.params.registryCode;
    const schemeCodeValue = this.route.snapshot.params.schemeCode;
    const extensionCodeValue = this.route.snapshot.params.extensionCode;

    if (!registryCodeValue || !schemeCodeValue) {
      throw new Error(
        `Illegal route, registry: '${registryCodeValue}', scheme: '${schemeCodeValue}', extension: '${extensionCodeValue}'`);
    }

    this.dataService.getExtension(registryCodeValue, schemeCodeValue, extensionCodeValue).subscribe(extension => {
      this.extension = extension;
      this.locationService.atMemberCreatePage(this.extension);
    });
  }

  back() {

    this.router.navigate(this.extension.route);
  }

  addMemberValueToMemberValueList(memberValues: MemberValueType[], value: string, type: string) {
    if (value) {
      const valueType: ValueType | null = this.extension.propertyType.valueTypeForLocalName(type);
      if (valueType) {
        const memberData: MemberValueType = <MemberValueType> {
          id: undefined,
          value: value,
          valueType: valueType.serialize()
        };
        const memberValue: MemberValue = new MemberValue(memberData);
        memberValues.push(memberValue.serialize());
      }
    }
  }

  save(formData: any): Observable<any> {

    const { code, relatedMember, unaryOperator, comparisonOperator, dpmDomainDataType, dpmMetricDataType, dpmDomainReference, dpmHierarchyReference, dpmBalanceType, dpmFlowType, dpmMemberXBRLCodePrefix, validity, ...rest } = formData;

    const member: MemberType = <MemberType> {
      ...rest,
      code: code.serialize(),
      startDate: formatDate(validity.start),
      endDate: formatDate(validity.end),
      relatedMember: relatedMember ? relatedMember.serialize() : undefined,
      extension: this.extension.serialize()
    };

    const memberValues: MemberValueType[] = [];

    // TODO: Make this more dynamic!
    this.addMemberValueToMemberValueList(memberValues, unaryOperator, 'unaryOperator');
    this.addMemberValueToMemberValueList(memberValues, comparisonOperator, 'comparisonOperator');
    this.addMemberValueToMemberValueList(memberValues, dpmDomainDataType, 'dpmDomainDataType');
    this.addMemberValueToMemberValueList(memberValues, dpmMetricDataType, 'dpmMetricDataType');
    this.addMemberValueToMemberValueList(memberValues, dpmDomainReference, 'dpmDomainReference');
    this.addMemberValueToMemberValueList(memberValues, dpmHierarchyReference, 'dpmHierarchyReference');
    this.addMemberValueToMemberValueList(memberValues, dpmBalanceType, 'dpmBalanceType');
    this.addMemberValueToMemberValueList(memberValues, dpmFlowType, 'dpmFlowType');
    this.addMemberValueToMemberValueList(memberValues, dpmMemberXBRLCodePrefix, 'dpmMemberXBRLCodePrefix');

    member.memberValues = memberValues;

    return this.dataService.createMember(member,
      this.extension.parentCodeScheme.codeRegistry.codeValue,
      this.extension.parentCodeScheme.codeValue,
      this.extension.codeValue)
      .pipe(tap(createdMember => {
        this.router.navigate(createdMember.route);
      }));
  }

  get loading(): boolean {

    return this.extension == null;
  }

  canSave() {

    return this.memberForm.valid;
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

  get allCodeSchemes(): CodeScheme[] {

    return [this.extension.parentCodeScheme, ...this.extension.codeSchemes];
  }

  get showCodeDetailLabel(): boolean {

    const currentCode: Code = this.memberForm.controls['code'].value;
    if (currentCode) {
      return currentCode.codeScheme.id !== this.extension.parentCodeScheme.id;
    } else {
      return false;
    }
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
}
