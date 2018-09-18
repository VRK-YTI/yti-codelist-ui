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
import { ExtensionScheme } from '../../entities/extension-scheme';
import { flatMap, tap } from 'rxjs/operators';
import { ExtensionSchemeExtensionsImportModalService } from '../member/member-import-modal.component';
import { changeToRestrictedStatus } from '../../utils/status-check';
import { MemberSimple } from '../../entities/member-simple';

@Component({
  selector: 'app-extension-scheme',
  templateUrl: './extension-scheme.component.html',
  styleUrls: ['./extension-scheme.component.scss'],
  providers: [EditableService],
})
export class ExtensionSchemeComponent implements OnInit, EditingComponent {

  @ViewChild('tabSet') tabSet: NgbTabset;

  extensionScheme: ExtensionScheme;
  extensions: MemberSimple[];
  env: string;

  constructor(private userService: UserService,
              private dataService: DataService,
              private route: ActivatedRoute,
              private router: Router,
              private locationService: LocationService,
              public languageService: LanguageService,
              private editableService: EditableService,
              private confirmationModalService: CodeListConfirmationModalService,
              private extensionSchemeExtensionsImportModalService: ExtensionSchemeExtensionsImportModalService,
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
    const extensionSchemeCodeValue = this.route.snapshot.params.extensionSchemeCode;

    if (!registryCodeValue || !schemeCodeValue || !extensionSchemeCodeValue) {
      throw new Error(
        `Illegal route, registry: '${registryCodeValue}', scheme: '${schemeCodeValue}', extensionScheme: '${extensionSchemeCodeValue}`);
    }

    this.dataService.getExtensionScheme(registryCodeValue, schemeCodeValue, extensionSchemeCodeValue).subscribe(extensionScheme => {
      this.extensionScheme = extensionScheme;
      this.locationService.atExtensionPage(extensionScheme);
    });

    this.dataService.getSimpleMembers(registryCodeValue, schemeCodeValue, extensionSchemeCodeValue).subscribe(extensions => {
      this.extensions = extensions;
    });
  }

  refreshExtensions() {
    this.dataService.getSimpleMembers(
      this.extensionScheme.parentCodeScheme.codeRegistry.codeValue,
      this.extensionScheme.parentCodeScheme.codeValue,
      this.extensionScheme.codeValue).subscribe(extensions => {
      this.extensions = extensions;
    });
  }

  get loading(): boolean {
    return this.extensionScheme == null || this.extensions == null;
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
    this.router.navigate(this.extensionScheme.parentCodeScheme.route);
  }

  isEditing(): boolean {
    return this.editableService.editing;
  }

  delete() {
    this.confirmationModalService.openRemoveExtensionScheme()
      .then(() => {
        this.dataService.deleteExtensionScheme(this.extensionScheme).subscribe(res => {
          this.router.navigate(this.extensionScheme.parentCodeScheme.route);
        }, error => {
          this.errorModalService.openSubmitError(error);
        });
      }, ignoreModalClose);
  }

  importMembers() {
    this.extensionSchemeExtensionsImportModalService.open(this.extensionScheme).then(success => {
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
          registryCode: this.extensionScheme.parentCodeScheme.codeRegistry.codeValue,
          schemeCode: this.extensionScheme.parentCodeScheme.codeValue,
          extensionSchemeCode: this.extensionScheme.codeValue
        }
      ]
    );
  }

  get showMenu(): boolean {
    return this.canAddExtension || this.canDelete;
  }

  get canDelete() {
    return this.userService.user.superuser ||
      (this.authorizationManager.canDelete(this.extensionScheme.parentCodeScheme) &&
        (this.extensionScheme.parentCodeScheme.status === 'INCOMPLETE' ||
          this.extensionScheme.parentCodeScheme.status === 'DRAFT' ||
          this.extensionScheme.parentCodeScheme.status === 'SUGGESTED' ||
          this.extensionScheme.parentCodeScheme.status === 'SUBMITTED'));
  }

  get canAddExtension(): boolean {
    return this.authorizationManager.canEdit(this.extensionScheme.parentCodeScheme) && !this.extensionScheme.restricted;
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
    
    const {validity, ...rest} = formData;
    const updateExtensionScheme = this.extensionScheme.clone();

    Object.assign(updateExtensionScheme, {
      ...rest,
      startDate: validity.start,
      endDate: validity.end
    });

    const save = () => {
      console.log('Store ExtensionScheme changes to server!');
      return this.dataService.saveExtensionScheme(updateExtensionScheme.serialize()).pipe(tap(() => this.ngOnInit()));
    };

    if (changeToRestrictedStatus(this.extensionScheme, formData.status)) {
      return from(this.confirmationModalService.openChangeToRestrictedStatus()).pipe(flatMap(save));
    } else {
      return save();
    }
  }

  get showUnfinishedFeature() {
    return this.env === 'dev' || this.env === 'local';
  }
}
