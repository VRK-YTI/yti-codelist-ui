import { AfterViewInit, Component, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { EditableService } from '../../services/editable.service';
import { DataService } from '../../services/data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { formatDate, validDateRange } from '../../utils/date';
import { CodeScheme } from '../../entities/code-scheme';
import { CodeType, ExtensionType, MemberSimpleType, MemberValueType } from '../../services/api-schema';
import { restrictedStatuses, Status } from 'yti-common-ui/entities/status';
import { from, Observable } from 'rxjs';
import { TerminologyIntegrationModalService } from '../terminology-integration/terminology-integration-codescheme-modal.component';
import { ignoreModalClose } from 'yti-common-ui/utils/modal';
import { Concept } from '../../entities/concept';
import { LocationService } from '../../services/location.service';
import { ExternalReference } from '../../entities/external-reference';
import { flatMap, map, tap } from 'rxjs/operators';
import { contains } from 'yti-common-ui/utils/array';
import { CodeListConfirmationModalService } from '../common/confirmation-modal.service';
import { ExtensionSimple } from '../../entities/extension-simple';
import { comparingLocalizable } from 'yti-common-ui/utils/comparator';
import { LanguageService } from '../../services/language.service';
import { Extension } from '../../entities/extension';
import { MemberSimple } from '../../entities/member-simple';
import { MemberValue } from '../../entities/member-value';
import { PropertyType } from '../../entities/property-type';
import { ValueType } from '../../entities/value-type';
import { MemberValueValidators } from '../form/member-value-validators';

@Component({
  selector: 'app-code-create',
  templateUrl: './code-create.component.html',
  styleUrls: ['./code-create.component.scss'],
  providers: [EditableService]
})
export class CodeCreateComponent implements OnInit, AfterViewInit {

  codeScheme: CodeScheme;

  codeForm = new FormGroup({
    codeValue: new FormControl('', [Validators.required, this.isCodeValuePatternValid], this.codeValueExistsValidator()),
    prefLabel: new FormControl({}),
    description: new FormControl({}),
    definition: new FormControl({}),
    shortName: new FormControl(''),
    externalReferences: new FormControl([]),
    broaderCode: new FormControl(null),
    validity: new FormControl({ start: null, end: null }, validDateRange),
    status: new FormControl('DRAFT' as Status),
    conceptUriInVocabularies: new FormControl(''),
    codeExtensions: new FormArray([]),
    subCodeScheme: new FormControl(null)
  });

  constructor(private dataService: DataService,
              private route: ActivatedRoute,
              private router: Router,
              private editableService: EditableService,
              private terminologyIntegrationModalService: TerminologyIntegrationModalService,
              private locationService: LocationService,
              private confirmationModalService: CodeListConfirmationModalService,
              private languageService: LanguageService) {

    editableService.onSave = (formValue: any) => this.save(formValue);
    editableService.cancel$.subscribe(() => this.back());
    this.editableService.edit();
  }

  ngOnInit() {
    const registryCode = this.route.snapshot.params.registryCode;
    const schemeCode = this.route.snapshot.params.schemeCode;

    if (!registryCode || !schemeCode) {
      throw new Error(`Illegal route, registry: '${registryCode}', scheme: '${schemeCode}'`);
    }

    this.dataService.getCodeScheme(registryCode, schemeCode).subscribe(codeScheme => {
      this.codeScheme = codeScheme;
      this.locationService.atCodeCreatePage(this.codeScheme);

      this.initCodeExtensions();
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.openTerminologyModal();
    });
  }

  back() {
    this.router.navigate(this.codeScheme.route);
  }

  save(formData: any): Observable<any> {

    const { validity, externalReferences, codeExtensions, ...rest } = formData;

    const code: CodeType = <CodeType> {
      ...rest,
      startDate: formatDate(validity.start),
      endDate: formatDate(validity.end),
      externalReferences: externalReferences.map((er: ExternalReference) => er.serialize())
    };

    const extensions: Extension[] | null = this.constructExtensions(codeExtensions);

    if (extensions) {
      code.codeExtensions = extensions.map(extension => extension.serialize());
    }

    const save = () => {
      return this.dataService.createCode(code, this.codeScheme.codeRegistry.codeValue, this.codeScheme.codeValue)
        .pipe(tap(createdCode => {
          this.router.navigate(createdCode.route);
        }));
    };

    if (contains(restrictedStatuses, code.status)) {
      return from(this.confirmationModalService.openChooseToRestrictedStatus()).pipe(flatMap(save));
    } else {
      return save();
    }
  }

  get loading(): boolean {
    return this.codeScheme == null;
  }

  get codeSchemes(): CodeScheme[] {
    const codeSchemes: CodeScheme[] = [];
    codeSchemes.push(this.codeScheme);
    return codeSchemes;
  }

  isCodeValuePatternValid(control: AbstractControl) {
    const isCodeValueValid = control.value.match(/^[a-zA-Z0-9_\-\.\+\*\&\#]*$/);
    return !isCodeValueValid ? { 'codeCodeValueValidationError': { value: control.value } } : null;
  }

  codeValueExistsValidator(): AsyncValidatorFn {
    return (control: AbstractControl) => {
      const registryCode = this.codeScheme.codeRegistry.codeValue ? this.codeScheme.codeRegistry.codeValue : '';
      const schemeCode = this.codeScheme.codeValue;
      const validationError = {
        codeValueExists: {
          valid: false
        }
      };
      return this.dataService.codeCodeValueExists(registryCode, schemeCode, control.value)
        .pipe(map(exists => exists ? validationError : null));
    };
  }

  openTerminologyModal() {
    this.terminologyIntegrationModalService.open(false, 'code').then(concept => this.putConceptStuffInPlace(concept), ignoreModalClose);
  }

  removeConceptUriInVocabularies() {
    this.codeForm.controls['conceptUriInVocabularies'].setValue('');
  }

  putConceptStuffInPlace(concept: Concept) {
    this.codeForm.patchValue({ prefLabel: concept.prefLabel });
    this.codeForm.patchValue({ definition: concept.definition });
    this.codeForm.patchValue({ conceptUriInVocabularies: concept.uri });
  }

  get codeExtensionsFormArray(): FormArray {
    return this.codeForm.get('codeExtensions') as FormArray;
  }

  get codeExtensions(): ExtensionSimple[] {
    return this.codeScheme.extensions.filter(extension => extension.propertyType.context === 'CodeExtension').sort(comparingLocalizable<ExtensionSimple>(this.languageService, item =>
      item.prefLabel ? item.prefLabel : {}));
  }

  getExtensionDisplayName(extensionId: string): string {
    const extension: ExtensionSimple | null = this.getExtension(extensionId);
    if (extension) {
      return extension.getDisplayName(this.languageService);
    }
    return '';
  }

  getExtension(extensionId: string): ExtensionSimple | null {
    for (const extension of this.codeScheme.extensions) {
      if (extension.id === extensionId) {
        return extension;
      }
    }
    return null;
  }

  initCodeExtensions() {
    this.codeExtensionsFormArray.controls = [];
    const codeExtensions: ExtensionSimple[] = this.codeScheme.extensions.filter(extension => extension.propertyType.localName === 'CodeExtension');
    if (codeExtensions) {
      this.codeExtensions.forEach(codeExtension => {
        this.codeExtensionsFormArray.push(this.initExtension(codeExtension));
      });
    }
  }

  initExtension(extension: ExtensionSimple): FormGroup {
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

  initMembers(extension: ExtensionSimple): FormArray {
    const membersArray: FormArray = new FormArray([]);
    membersArray.push(this.initMember(extension));
    return membersArray;
  }

  initMember(extension: ExtensionSimple): FormGroup {
    return new FormGroup({
      id: new FormControl(null),
      url: new FormControl(null),
      uri: new FormControl(null),
      memberValues: this.initMemberValues(extension)
    });
  }

  initMemberValues(extension: ExtensionSimple): FormArray {
    const memberValuesFormArray: FormArray = new FormArray([]);
    const valueTypes: ValueType[] = extension.propertyType.valueTypes.sort(comparingLocalizable<ValueType>(this.languageService, item => item.prefLabel ? item.prefLabel : {}));
    if (valueTypes) {
      valueTypes.forEach(valueType => {
        const memberValueGroup: FormGroup = new FormGroup({
          valueType: new FormControl(valueType),
          value: new FormControl('', MemberValueValidators.validateMemberValueAgainstRegexpAndRequired(valueType))
        });
        memberValuesFormArray.push(memberValueGroup);
      })
    }
    return memberValuesFormArray;
  }

  constructExtensions(extensionsArray: Array<Extension>): Extension[] | null {

    const extensions: Extension[] = [];

    extensionsArray.forEach((extension: Extension) => {
      const extensionType: ExtensionType = <ExtensionType> {
        id: extension.id,
        uri: extension.uri,
        url: extension.url,
        codeValue: extension.codeValue,
        status: extension.status,
        propertyType: extension.propertyType as PropertyType,
        members: this.constructMembers(extension.members)
      };
      extensions.push(new Extension(extensionType));
    });

    if (extensions.length > 0) {
      return extensions;
    }

    return null;
  }

  constructMembers(membersArray: Array<MemberSimple>): MemberSimpleType[] | null {

    const members: MemberSimpleType[] = [];

    membersArray.forEach(member => {
      const memberType: MemberSimpleType = <MemberSimpleType> {
        id: member.id,
        uri: member.uri,
        url: member.url,
        memberValues: this.constructMemberValues(member.memberValues)
      };
      members.push(memberType);
    });

    if (members.length > 0) {
      return members;
    }

    return null;
  }

  constructMemberValues(memberValuesArray: Array<MemberValue>): MemberValueType[] | null {

    const memberValues: MemberValueType[] = [];

    memberValuesArray.forEach(memberValue => {
      const memberValueType: MemberValueType = <MemberValueType> {
        id: memberValue.id,
        value: memberValue.value,
        valueType: memberValue.valueType as ValueType
      };
      memberValues.push(memberValueType);
    });

    if (memberValues.length > 0) {
      return memberValues;
    }
    return null;
  }
}
