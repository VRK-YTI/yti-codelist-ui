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

    console.log('MemberCreateComponent onInit');
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

  save(formData: any): Observable<any> {

    console.log('Saving new Member');

    const { code, relatedMember, unaryOperator, comparisonOperator, validity, ...rest } = formData;

    const member: MemberType = <MemberType> {
      ...rest,
      code: code.serialize(),
      startDate: formatDate(validity.start),
      endDate: formatDate(validity.end),
      relatedMember: relatedMember.serialize(),
      extension: this.extension.serialize()
    };

    const memberValues: MemberValueType[] = [];

    if (unaryOperator) {
      const valueType: ValueType | null = this.extension.propertyType.valueTypeForLocalName('unaryOperator');
      if (valueType) {
        const memberData: MemberValueType = <MemberValueType> {
          id: undefined,
          value: unaryOperator,
          valueType: valueType.serialize(),
          created: undefined,
          modified: undefined
        };
        const memberValue: MemberValue = new MemberValue(memberData);
        memberValues.push(memberValue.serialize());
      }
    }

    if (comparisonOperator) {
      const valueType: ValueType | null = this.extension.propertyType.valueTypeForLocalName('comparisonOperator');
      if (valueType) {
        const memberData: MemberValueType = <MemberValueType> {
          id: undefined,
          value: comparisonOperator,
          valueType: valueType.serialize(),
          created: undefined,
          modified: undefined
        };
        const memberValue: MemberValue = new MemberValue(memberData);
        memberValues.push(memberValue.serialize());
      }
    }

    member.memberValues = memberValues;

    return this.dataService.createMember(member,
      this.extension.parentCodeScheme.codeRegistry.codeValue,
      this.extension.parentCodeScheme.codeValue,
      this.extension.codeValue)
      .pipe(tap(createdMember => {
        console.log('Saved new Member');
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
}
