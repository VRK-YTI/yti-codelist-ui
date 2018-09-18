import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { EditableService } from '../../services/editable.service';
import { DataService } from '../../services/data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ExtensionScheme } from '../../entities/extension-scheme';
import { MemberType } from '../../services/api-schema';
import { LanguageService } from '../../services/language.service';
import { LocationService } from '../../services/location.service';
import { CodeScheme } from '../../entities/code-scheme';
import { formatDate, validDateRange } from '../../utils/date';
import { tap } from 'rxjs/operators';
import { Code } from '../../entities/code';

@Component({
  selector: 'app-member-create',
  templateUrl: './member-create.component.html',
  styleUrls: ['./member-create.component.scss'],
  providers: [EditableService]
})
export class MemberCreateComponent implements OnInit {

  extensionScheme: ExtensionScheme;

  memberForm = new FormGroup({
    prefLabel: new FormControl({}),
    memberValue: new FormControl(''),
    code: new FormControl(null, Validators.required),
    broaderMember: new FormControl(null),
    validity: new FormControl({ start: null, end: null }, validDateRange)
  });

  constructor(private dataService: DataService,
              private route: ActivatedRoute,
              private router: Router,
              private editableService: EditableService,
              public languageService: LanguageService,
              private locationService: LocationService) {

    editableService.onSave = (formValue: any) => this.save(formValue);
    editableService.cancel$.subscribe(() => this.back());
    this.editableService.edit();
  }

  ngOnInit() {
    console.log('MemberCreateComponent onInit');
    const registryCodeValue = this.route.snapshot.params.registryCode;
    const schemeCodeValue = this.route.snapshot.params.schemeCode;
    const extensionSchemeCodeValue = this.route.snapshot.params.extensionSchemeCode;

    if (!registryCodeValue || !schemeCodeValue) {
      throw new Error(
        `Illegal route, registry: '${registryCodeValue}', scheme: '${schemeCodeValue}', extensionScheme: '${extensionSchemeCodeValue}'`);
    }

    this.dataService.getExtensionScheme(registryCodeValue, schemeCodeValue, extensionSchemeCodeValue).subscribe(extensionScheme => {
      this.extensionScheme = extensionScheme;
      this.locationService.atMemberCreatePage(this.extensionScheme);
    });
  }

  back() {
    this.router.navigate(this.extensionScheme.route);
  }

  save(formData: any): Observable<any> {

    console.log('Saving new Member');

    const { code, currentExtension, validity, ...rest } = formData;

    const member: MemberType = <MemberType> {
      ...rest,
      code: code,
      startDate: formatDate(validity.start),
      endDate: formatDate(validity.end),
      extension: currentExtension
    };

    return this.dataService.createMember(member,
      this.extensionScheme.parentCodeScheme.codeRegistry.codeValue,
      this.extensionScheme.parentCodeScheme.codeValue,
      this.extensionScheme.codeValue)
      .pipe(tap(createdMember => {
        console.log('Saved new Member');
        this.router.navigate(createdMember.route);
      }));
  }

  get loading(): boolean {
    return this.extensionScheme == null;
  }

  canSave() {
    return this.memberForm.valid;
  }

  get requireMemberValue(): boolean {
    return this.extensionScheme.propertyType.localName === 'calculationHierarchy';
  }

  get allCodeSchemes(): CodeScheme[] {
    return [ this.extensionScheme.parentCodeScheme, ...this.extensionScheme.codeSchemes ];
  }

  get showCodeDetailLabel(): boolean {
    const currentCode: Code = this.memberForm.controls['code'].value;
    if (currentCode) {
      return currentCode.codeScheme.id !== this.extensionScheme.parentCodeScheme.id;
    } else {
      return false;
    }
  }
}
