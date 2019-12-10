import { Component, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../../services/data.service';
import { Code } from '../../entities/code';
import { ActivatedRoute, Router } from '@angular/router';
import { LocationService } from '../../services/location.service';
import { EditableService, EditingComponent } from '../../services/editable.service';
import { NgbTabChangeEvent, NgbTabset } from '@ng-bootstrap/ng-bootstrap';
import { ignoreModalClose } from 'yti-common-ui/utils/modal';
import { from, Observable } from 'rxjs';
import { CodeScheme } from '../../entities/code-scheme';
import { UserService } from 'yti-common-ui/services/user.service';
import { CodeListErrorModalService } from '../common/error-modal.service';
import { CodeListConfirmationModalService } from '../common/confirmation-modal.service';
import { AuthorizationManager } from '../../services/authorization-manager.service';
import { LanguageService } from '../../services/language.service';
import { flatMap, tap } from 'rxjs/operators';
import { changeToRestrictedStatus } from '../../utils/status-check';
import { Extension } from '../../entities/extension';
import { ExtensionType, MemberSimpleType, MemberValueType } from '../../services/api-schema';
import { PropertyType } from '../../entities/property-type';
import { MemberSimple } from '../../entities/member-simple';
import { MemberValue } from '../../entities/member-value';
import { ValueType } from '../../entities/value-type';
import { formatDate } from '../../utils/date';
import { AlertModalService } from 'yti-common-ui/components/alert-modal.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-code',
  templateUrl: './code.component.html',
  styleUrls: ['./code.component.scss'],
  providers: [EditableService]
})
export class CodeComponent implements OnInit, EditingComponent {

  @ViewChild('tabSet') tabSet: NgbTabset;

  code: Code;
  codeScheme: CodeScheme;
  deleting: boolean;

  constructor(public languageService: LanguageService,
              private userService: UserService,
              private dataService: DataService,
              private route: ActivatedRoute,
              private router: Router,
              private locationService: LocationService,
              private editableService: EditableService,
              private confirmationModalService: CodeListConfirmationModalService,
              private errorModalService: CodeListErrorModalService,
              private authorizationManager: AuthorizationManager) {

    editableService.onSave = (formValue: any) => this.save(formValue);
  }

  ngOnInit() {

    const registryCode = this.route.snapshot.params.registryCode;
    const schemeCode = this.route.snapshot.params.schemeCode;
    const codeCode = this.route.snapshot.params.codeCode;

    if (!codeCode || !registryCode || !schemeCode) {
      throw new Error(`Illegal route, codeCode: '${codeCode}', registry: '${registryCode}', scheme: '${schemeCode}'`);
    }

    this.dataService.getCode(registryCode, schemeCode, codeCode).subscribe(code => {
      this.code = code;
      this.locationService.atCodePage(code);
    });

    this.dataService.getCodeScheme(registryCode, schemeCode).subscribe(codeScheme => {
      this.codeScheme = codeScheme;
    });
  }

  get loading(): boolean {
    return this.code == null || this.codeScheme == null || this.deleting;
  }

  onTabChange(event: NgbTabChangeEvent) {

    if (this.isEditing()) {
      event.preventDefault();

      this.confirmationModalService.openEditInProgress()
        .then(() => {
          this.cancelEditing();
          this.tabSet.activeId = event.nextId;
        }, ignoreModalClose);
    }
  }

  isEditing(): boolean {
    return this.editableService.editing;
  }

  navigateToRoute(route: any[]) {
    this.router.navigate(route);
  }

  get showMenu(): boolean {
    return this.canDelete;
  }

  get canDelete() {
    return this.userService.user.superuser ||
      (this.authorizationManager.canDelete(this.codeScheme) &&
        (this.codeScheme.status === 'INCOMPLETE' ||
          this.codeScheme.status === 'DRAFT' ||
          this.codeScheme.status === 'SUGGESTED'));
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

  delete() {
    this.confirmationModalService.openRemoveCode()
      .then(() => {
        this.deleting = true;
        this.dataService.deleteCode(this.code).subscribe(res => {
          this.deleting = false;
          if (res.meta.code === 200) {
            this.router.navigate(this.code.codeScheme.route);
          } else {
            this.errorModalService.openSubmitError(res);
          }
        }, error => {
          this.deleting = false;
          this.errorModalService.openSubmitError(error);
        });
      }, ignoreModalClose);
  }

  cancelEditing(): void {
    this.editableService.cancel();
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

    const codePlainType = this.code.serializeToPlainType();

    membersArray.forEach(member => {
      const memberType: MemberSimpleType = <MemberSimpleType> {
        id: member.id,
        uri: member.uri,
        url: member.url,
        startDate: formatDate(member.startDate),
        endDate: formatDate(member.endDate),
        code: codePlainType,
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

  save(formData: any): Observable<any> {

    const { validity, codeExtensions, ...rest } = formData;

    const updatedCode = this.code.clone();

    const extensions: Extension[] | null = this.constructExtensions(codeExtensions);

    Object.assign(updatedCode, {
      ...rest,
      startDate: validity.start,
      endDate: validity.end,
      codeExtensions: extensions
    });

    const save = () => {
      return this.dataService.saveCode(updatedCode.serialize()).pipe(tap(() => this.ngOnInit()));
    };

    if (changeToRestrictedStatus(this.code, formData.status)) {
      return from(this.confirmationModalService.openChangeToRestrictedStatus()).pipe(flatMap(save));
    } else {
      return save();
    }
  }
}
