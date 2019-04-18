import { Component, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../../services/data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LocationService } from '../../services/location.service';
import { EditableService, EditingComponent } from '../../services/editable.service';
import { NgbTabChangeEvent, NgbTabset } from '@ng-bootstrap/ng-bootstrap';
import { ignoreModalClose } from 'yti-common-ui/utils/modal';
import { Observable } from 'rxjs';
import { UserService } from 'yti-common-ui/services/user.service';
import { CodeListErrorModalService } from '../common/error-modal.service';
import { CodeListConfirmationModalService } from '../common/confirmation-modal.service';
import { AuthorizationManager } from '../../services/authorization-manager.service';
import { Member } from '../../entities/member';
import { Extension } from '../../entities/extension';
import { LanguageService } from '../../services/language.service';
import { TranslateService } from '@ngx-translate/core';
import { tap } from 'rxjs/operators';
import { MemberValueType } from '../../services/api-schema';
import { MemberValue } from '../../entities/member-value';
import { ValueType } from '../../entities/value-type';

@Component({
  selector: 'app-member',
  templateUrl: './member.component.html',
  styleUrls: ['./member.component.scss'],
  providers: [EditableService]
})
export class MemberComponent implements OnInit, EditingComponent {

  @ViewChild('tabSet') tabSet: NgbTabset;

  member: Member;
  extension: Extension;
  deleting: boolean;

  constructor(private userService: UserService,
              private dataService: DataService,
              private route: ActivatedRoute,
              private router: Router,
              private locationService: LocationService,
              private editableService: EditableService,
              private confirmationModalService: CodeListConfirmationModalService,
              private errorModalService: CodeListErrorModalService,
              private authorizationManager: AuthorizationManager,
              public languageService: LanguageService,
              public translateService: TranslateService) {

    editableService.onSave = (formValue: any) => this.save(formValue);
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
      this.locationService.atMemberPage(member);
      console.log(member);
    });

    this.dataService.getExtension(registryCodeValue, schemeCodeValue, extensionCodeValue).subscribe(extension => {
      this.extension = extension;
    });
  }

  get loading(): boolean {

    return this.member == null || this.extension == null || this.deleting;
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
      (this.authorizationManager.canDelete(this.extension.parentCodeScheme) &&
        (this.extension.status === 'INCOMPLETE' ||
          this.extension.status === 'DRAFT' ||
          this.extension.status === 'SUGGESTED' ||
          this.extension.status === 'SUBMITTED'));
  }

  get isSuperUser() {

    return this.userService.user.superuser;
  }

  get restricted() {

    if (this.isSuperUser) {
      return false;
    }
    return this.extension.restricted;
  }

  delete() {

    this.confirmationModalService.openRemoveMember()
      .then(() => {
        this.deleting = true;
        this.dataService.deleteMember(this.member).subscribe(res => {
          this.deleting = false;
          this.router.navigate(this.member.extension.route);
        }, error => {
          this.deleting = false;
          this.errorModalService.openSubmitError(error);
        });
      }, ignoreModalClose);
  }

  cancelEditing(): void {

    this.editableService.cancel();
  }

  findIdFromMembersForValueType(valueType: ValueType): MemberValue | null {
    let memberValue: MemberValue | null = null;
    this.member.memberValues.forEach(mv => {
      if (mv.valueType.localName === valueType.localName) {
        memberValue = mv;
      }
    });
    return memberValue;
  }

  addMemberValueToMemberValueList(memberValues: MemberValue[], value: string, type: string) {
    const valueType = this.extension.propertyType.valueTypeForLocalName(type);
    if (valueType) {
      const data: MemberValueType = <MemberValueType> {
        value: value,
        valueType: valueType
      };
      const existingMemberValue = this.findIdFromMembersForValueType(valueType);
      if (existingMemberValue) {
        data.id = existingMemberValue.id;
      }
      const unaryOperatorMemberValue: MemberValue = new MemberValue(data);
      memberValues.push(unaryOperatorMemberValue);
    }
  }

  save(formData: any): Observable<any> {

    // TODO: Refactor this hacking so that memberValues are handled dynamically as a list in a dedicated formControl and component.
    const { validity, unaryOperator, comparisonOperator, dpmDomainDataType, dpmMetricDataType, dpmDomainReference, dpmHierarchyReference, dpmBalanceType, dpmFlowType, dpmMemberXBRLCodePrefix, ...rest } = formData;
    const updatedMember = this.member.clone();

    const updatedMemberValues: MemberValue[] = [];

    this.addMemberValueToMemberValueList(updatedMemberValues, unaryOperator, 'unaryOperator');
    this.addMemberValueToMemberValueList(updatedMemberValues, comparisonOperator, 'comparisonOperator');
    this.addMemberValueToMemberValueList(updatedMemberValues, dpmDomainDataType, 'dpmDomainDataType');
    this.addMemberValueToMemberValueList(updatedMemberValues, dpmMetricDataType, 'dpmMetricDataType');
    this.addMemberValueToMemberValueList(updatedMemberValues, dpmDomainReference, 'dpmDomainReference');
    this.addMemberValueToMemberValueList(updatedMemberValues, dpmHierarchyReference, 'dpmHierarchyReference');
    this.addMemberValueToMemberValueList(updatedMemberValues, dpmBalanceType, 'dpmBalanceType');
    this.addMemberValueToMemberValueList(updatedMemberValues, dpmFlowType, 'dpmFlowType');
    this.addMemberValueToMemberValueList(updatedMemberValues, dpmMemberXBRLCodePrefix, 'dpmMemberXBRLCodePrefix');

    updatedMember.memberValues = updatedMemberValues;

    Object.assign(updatedMember, {
      ...rest,
      startDate: validity.start,
      endDate: validity.end
    });

    return this.dataService.saveMember(updatedMember.serialize()).pipe(tap(() => this.ngOnInit()));
  }
}
