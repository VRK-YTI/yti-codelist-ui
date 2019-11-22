import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
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
import { ConfigurationService } from '../../services/configuration.service';
import { CodeScheme } from '../../entities/code-scheme';
import { AlertModalService } from '../common/alert-modal.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-extension',
  templateUrl: './extension.component.html',
  styleUrls: ['./extension.component.scss'],
  providers: [EditableService],
})
export class ExtensionComponent implements OnInit, EditingComponent, AfterViewInit {

  @ViewChild('tabSet') tabSet: NgbTabset;

  extension: Extension;
  codeScheme: CodeScheme;
  members: MemberSimple[];
  deleting: boolean;
  initialTabId: string | undefined = undefined;
  numberOfMissingMembersThatGotCreated: string | null = null;

  constructor(private userService: UserService,
              private dataService: DataService,
              private route: ActivatedRoute,
              private router: Router,
              private locationService: LocationService,
              private translateService: TranslateService,
              public languageService: LanguageService,
              private editableService: EditableService,
              private confirmationModalService: CodeListConfirmationModalService,
              private extensionMembersImportModalService: MembersImportModalService,
              private errorModalService: CodeListErrorModalService,
              private authorizationManager: AuthorizationManager,
              private configurationService: ConfigurationService,
              private alertModalService: AlertModalService) {

    editableService.onSave = (formValue: any) => this.save(formValue);
  }

  ngOnInit() {

    const registryCodeValue = this.route.snapshot.params.registryCode;
    const schemeCodeValue = this.route.snapshot.params.schemeCode;
    const extensionCodeValue = this.route.snapshot.params.extensionCode;

    if (!registryCodeValue || !schemeCodeValue || !extensionCodeValue) {
      throw new Error(
        `Illegal route, registry: '${registryCodeValue}', scheme: '${schemeCodeValue}', extension: '${extensionCodeValue}`);
    }

    this.dataService.getCodeScheme(registryCodeValue, schemeCodeValue).subscribe(codeScheme => {
      this.codeScheme = codeScheme;
    });

    this.dataService.getExtension(registryCodeValue, schemeCodeValue, extensionCodeValue).subscribe(extension => {
      this.extension = extension;
      this.locationService.atExtensionPage(extension);
    }, error => { // in case the user comes thru an old broken URL, redirect here to the parent codescheme.
      this.alertModalService.openWithMessageAndTitleAndShowOkButtonAndReturnPromise('MISSING_RESOURCE', this.translateService.instant('REDIRECTING_TO_CODESCHEME_PAGE')).then(value => {
        this.goToParentCodeSchemePage();
      }).catch(() => {
        this.goToParentCodeSchemePage();
      });
    });

    this.dataService.getSimpleMembers(registryCodeValue, schemeCodeValue, extensionCodeValue).subscribe(members => {
      this.members = members;
    });
  }

  goToParentCodeSchemePage() {
    this.locationService.atCodeSchemePage(this.codeScheme);
    this.router.navigate(this.getRouteToCodeScheme(this.codeScheme.codeValue, this.codeScheme.codeRegistry.codeValue));
  }

  getRouteToCodeScheme(codeSchemeCodeValue: string, codeRegistryCodeValue: string): any[] {
    return [
      'codescheme',
      {
        registryCode: codeRegistryCodeValue,
        schemeCode: codeSchemeCodeValue
      }
    ];
  }

  ngAfterViewInit() {
    const goToMembersTab = this.route.snapshot.queryParamMap.get('goToMembersTab');
    if (goToMembersTab) {
      this.numberOfMissingMembersThatGotCreated = this.route.snapshot.queryParamMap.get('created');
      this.initialTabId = 'extension_members_tab';
    }
  }

  refreshExtensionsAndCodeScheme() {
    this.dataService.getSimpleMembers(
      this.extension.parentCodeScheme.codeRegistry.codeValue,
      this.extension.parentCodeScheme.codeValue,
      this.extension.codeValue).subscribe(members => {
      this.members = members;
    });
    this.dataService.getCodeScheme(this.codeScheme.codeRegistry.codeValue, this.codeScheme.codeValue).subscribe(codeScheme => {
      this.codeScheme = codeScheme;
    })
  }

  get loading(): boolean {
    return this.extension == null || this.codeScheme == null || this.members == null || this.deleting;
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
        this.refreshExtensionsAndCodeScheme();
      }
    }, ignoreModalClose);
  }

  createMember() {
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

  createMissingMembers() {
    const codeSchemes: CodeScheme[] = this.extension.codeSchemes;
    if (!codeSchemes.find(cs => cs.id === this.extension.parentCodeScheme.id)) {
      codeSchemes.push(this.extension.parentCodeScheme);
    }

    this.confirmationModalService.openCreateMissingExtensionMembers(codeSchemes).then(() => {
      const modalRef = this.alertModalService.open('Please wait. This could take a while...');
      modalRef.enableClosingActions = false;
      this.dataService.createMissingMembers(this.extension.parentCodeScheme.codeRegistry.codeValue,
        this.extension.parentCodeScheme.id,
        this.extension.codeValue).subscribe(next => {
        const nrOfCreatedMembers: number = next.length;
        let messagePart = '';
        if (nrOfCreatedMembers === 0) {
          messagePart = this.translateService.instant('No new members created. All codes have a corresponding member already or there are no codes in the scope of the extension.');
          modalRef.message = messagePart;
          modalRef.enableClosingActions = true;
          modalRef.showOkButton = true;
        } else if (nrOfCreatedMembers === 1) {
          messagePart = this.translateService.instant(' missing member created.');
          modalRef.message = '' + nrOfCreatedMembers + messagePart;
          modalRef.enableClosingActions = true;
          modalRef.showOkButton = true;
        } else {
          messagePart = this.translateService.instant(' missing members created.');
          modalRef.message = '' + nrOfCreatedMembers + messagePart;
          modalRef.enableClosingActions = true;
          modalRef.showOkButton = true;
        }
        this.router.navigate(['re'], { skipLocationChange: true }).then(() => this.router.navigate(this.extension.route, {
          queryParams: {
            'goToMembersTab': true,
            'created': nrOfCreatedMembers
          }
        }));
      }, error => {
        this.errorModalService.openSubmitError(error);
      })
    }, ignoreModalClose);
  }

  get showMenu(): boolean {
    return this.canAddMember || this.canDelete;
  }

  get canDelete() {
    return this.userService.user.superuser ||
      (this.authorizationManager.canDelete(this.extension.parentCodeScheme) &&
        (this.extension.parentCodeScheme.status === 'INCOMPLETE' ||
          this.extension.parentCodeScheme.status === 'DRAFT' ||
          this.extension.parentCodeScheme.status === 'SUGGESTED'));
  }

  get canAddMember(): boolean {
    return this.authorizationManager.canEdit(this.extension.parentCodeScheme) && !this.extension.restricted && this.extension.propertyType.context === 'Extension';
  }

  get canImportMembers(): boolean {
    return this.authorizationManager.canEdit(this.extension.parentCodeScheme) && !this.extension.restricted;
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
      return this.dataService.saveExtension(updatedExtension.serialize()).pipe(tap(() => this.ngOnInit()));
    };

    if (changeToRestrictedStatus(this.extension, formData.status)) {
      return from(this.confirmationModalService.openChangeToRestrictedStatus()).pipe(flatMap(save));
    } else {
      return save();
    }
  }

  get showMembersTab(): boolean {
    const propertyTypeLocalName: string = this.extension.propertyType.context;
    return propertyTypeLocalName === 'Extension';
  }

  get showCrossReferenceExportFunctions(): boolean {
    return this.extension.propertyType.localName === 'crossReferenceList';
  }

  get showCrossReferenceListTab(): boolean {
    return this.extension.propertyType.localName === 'crossReferenceList';
  }
}
