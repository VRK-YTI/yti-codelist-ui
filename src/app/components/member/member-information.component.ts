import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { EditableService } from '../../services/editable.service';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../services/language.service';
import { UserService } from 'yti-common-ui/services/user.service';
import { DataService } from '../../services/data.service';
import { CodeListConfirmationModalService } from '../common/confirmation-modal.service';
import { Member } from '../../entities/member';
import { Extension } from '../../entities/extension';
import { LocationService } from '../../services/location.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CodeScheme } from '../../entities/code-scheme';
import { validDateRange } from '../../utils/date';
import { Code } from '../../entities/code';

@Component({
  selector: 'app-member-information',
  templateUrl: './member-information.component.html',
  styleUrls: ['./member-information.component.scss']
})
export class MemberInformationComponent implements OnInit, OnChanges, OnDestroy {

  @Input() currentMember: Member;
  extension: Extension;

  cancelSubscription: Subscription;

  memberForm = new FormGroup({
    prefLabel: new FormControl({}),
    memberValue: new FormControl(''),
    code: new FormControl(null, Validators.required),
    relatedMember: new FormControl(null),
    validity: new FormControl(null, validDateRange)
  });

  constructor(private route: ActivatedRoute,
              private router: Router,
              private locationService: LocationService,
              private dataService: DataService,
              private userService: UserService,
              private confirmationModalService: CodeListConfirmationModalService,
              private editableService: EditableService,
              public languageService: LanguageService) {

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

    this.dataService.getMember(memberId).subscribe(extension => {
      this.currentMember = extension;
      this.locationService.atMemberPage(extension);
    });

    this.dataService.getExtension(registryCodeValue, schemeCodeValue, extensionCodeValue).subscribe(extension => {
      this.extension = extension;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.reset();
  }

  reset() {
    const { startDate, endDate, ...rest } = this.currentMember;

    this.memberForm.reset({
      ...rest,
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
    return this.currentMember.extension.restricted;
  }

  ngOnDestroy() {
    this.cancelSubscription.unsubscribe();
  }

  get loading(): boolean {
    return this.extension == null || this.currentMember == null;
  }

  canSave() {
    return this.memberForm.valid;
  }

  get requireMemberValue(): boolean {
    return this.extension.propertyType.localName === 'calculationHierarchy';
  }

  get allCodeSchemes(): CodeScheme[] {
    return [ this.extension.parentCodeScheme, ...this.extension.codeSchemes ];
  }

  get showCodeDetailLabel(): boolean {
    const currentCode: Code = this.memberForm.controls['code'].value;
    if (currentCode) {
      return currentCode.codeScheme.id !== this.extension.parentCodeScheme.id;
    } else {
      return false;
    }
  }
}
