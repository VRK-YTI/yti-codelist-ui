import { Component, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../../services/data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LocationService } from '../../services/location.service';
import { EditableService, EditingComponent } from '../../services/editable.service';
import { NgbTabChangeEvent, NgbTabset } from '@ng-bootstrap/ng-bootstrap';
import { ignoreModalClose } from 'yti-common-ui//utils/modal';
import { from, Observable } from 'rxjs';
import { LanguageService } from '../../services/language.service';
import { UserService } from 'yti-common-ui/services/user.service';
import { CodeListConfirmationModalService } from '../common/confirmation-modal.service';
import { CodeListErrorModalService } from '../common/error-modal.service';
import { AuthorizationManager } from '../../services/authorization-manager.service';
import { Extension } from '../../entities/extension';
import { flatMap, tap } from 'rxjs/operators';
import { MembersImportModalService } from '../member/member-import-modal.component';
import { changeToRestrictedStatus } from '../../utils/status-check';
import { MemberSimple } from '../../entities/member-simple';

@Component({
  selector: 'app-extension',
  templateUrl: './extension.component.html',
  styleUrls: ['./extension.component.scss'],
  providers: [EditableService],
})
export class ExtensionComponent implements OnInit, EditingComponent {

  @ViewChild('tabSet') tabSet: NgbTabset;

  extension: Extension;
  members: MemberSimple[];
  env: string;
  deleting: boolean;

  constructor(private userService: UserService,
              private dataService: DataService,
              private route: ActivatedRoute,
              private router: Router,
              private locationService: LocationService,
              public languageService: LanguageService,
              private editableService: EditableService,
              private confirmationModalService: CodeListConfirmationModalService,
              private extensionMembersImportModalService: MembersImportModalService,
              private errorModalService: CodeListErrorModalService,
              private authorizationManager: AuthorizationManager) {

    editableService.onSave = (formValue: any) => this.save(formValue);

    dataService.getServiceConfiguration().subscribe(configuration => {
      this.env = configuration.env;
    });
  }

  ngOnInit() {

    const registryCodeValue = this.route.snapshot.params.registryCode;
    const schemeCodeValue = this.route.snapshot.params.schemeCode;
    const extensionCodeValue = this.route.snapshot.params.extensionCode;

    if (!registryCodeValue || !schemeCodeValue || !extensionCodeValue) {
      throw new Error(
        `Illegal route, registry: '${registryCodeValue}', scheme: '${schemeCodeValue}', extension: '${extensionCodeValue}`);
    }

    this.dataService.getExtension(registryCodeValue, schemeCodeValue, extensionCodeValue).subscribe(extension => {
      this.extension = extension;
      this.locationService.atExtensionPage(extension);
    });

    this.dataService.getSimpleMembers(registryCodeValue, schemeCodeValue, extensionCodeValue).subscribe(members => {
      this.members = members;
    });
  }

  refreshExtensions() {
    this.dataService.getSimpleMembers(
      this.extension.parentCodeScheme.codeRegistry.codeValue,
      this.extension.parentCodeScheme.codeValue,
      this.extension.codeValue).subscribe(members => {
      this.members = members;
    });
  }

  get loading(): boolean {
    return this.extension == null || this.members == null || this.deleting;
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

  back() {
    this.router.navigate(this.extension.parentCodeScheme.route);
  }

  isEditing(): boolean {
    return this.editableService.editing;
  }

  delete() {
    this.confirmationModalService.openRemoveExtension()
      .then(() => {
        this.deleting = true;
        this.dataService.deleteExtension(this.extension).subscribe(res => {
          this.deleting = false;
          this.router.navigate(this.extension.parentCodeScheme.route);
        }, error => {
          this.deleting = false;
          this.errorModalService.openSubmitError(error);
        });
      }, ignoreModalClose);
  }

  importMembers() {
    this.extensionMembersImportModalService.open(this.extension).then(success => {
      if (success) {
        this.refreshExtensions();
      }
    }, ignoreModalClose);
  }

  createMember() {
    console.log('Member create clicked.');
    this.router.navigate(
      ['createmember',
        {
          registryCode: this.extension.parentCodeScheme.codeRegistry.codeValue,
          schemeCode: this.extension.parentCodeScheme.codeValue,
          extensionCode: this.extension.codeValue
        }
      ]
    );
  }

  get showMenu(): boolean {
    return this.canAddExtension || this.canDelete;
  }

  get canDelete() {
    return this.userService.user.superuser ||
      (this.authorizationManager.canDelete(this.extension.parentCodeScheme) &&
        (this.extension.parentCodeScheme.status === 'INCOMPLETE' ||
          this.extension.parentCodeScheme.status === 'DRAFT' ||
          this.extension.parentCodeScheme.status === 'SUGGESTED' ||
          this.extension.parentCodeScheme.status === 'SUBMITTED'));
  }

  get canAddExtension(): boolean {
    return this.authorizationManager.canEdit(this.extension.parentCodeScheme) && !this.extension.restricted;
  }

  get isSuperUser() {
    return this.userService.user.superuser;
  }

  navigateToRoute(route: any[]) {
    this.router.navigate(route);
  }

  cancelEditing(): void {
    this.editableService.cancel();
  }

  save(formData: any): Observable<any> {

    const { validity, ...rest } = formData;
    const updatedExtension = this.extension.clone();

    Object.assign(updatedExtension, {
      ...rest,
      startDate: validity.start,
      endDate: validity.end
    });

    const save = () => {
      console.log('Store Extension changes to server!');
      return this.dataService.saveExtension(updatedExtension.serialize()).pipe(tap(() => this.ngOnInit()));
    };

    if (changeToRestrictedStatus(this.extension, formData.status)) {
      return from(this.confirmationModalService.openChangeToRestrictedStatus()).pipe(flatMap(save));
    } else {
      return save();
    }
  }

  get showUnfinishedFeature() {
    return this.env === 'dev' || this.env === 'local';
  }
}
