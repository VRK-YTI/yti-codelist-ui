import { Component, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../../services/data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LocationService } from '../../services/location.service';
import { EditableService, EditingComponent } from '../../services/editable.service';
import { NgbTabChangeEvent, NgbTabset } from '@ng-bootstrap/ng-bootstrap';
import { ignoreModalClose } from 'yti-common-ui/utils/modal';
import { Observable } from 'rxjs/Observable';
import { UserService } from 'yti-common-ui/services/user.service';
import { CodeListErrorModalService } from '../common/error-modal.service';
import { CodeListConfirmationModalService } from '../common/confirmation-modal.service';
import { AuthorizationManager } from '../../services/authorization-manager.service';
import { Extension } from '../../entities/extension';
import { ExtensionScheme } from '../../entities/extension-scheme';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-extension',
  templateUrl: './extension.component.html',
  styleUrls: ['./extension.component.scss'],
  providers: [EditableService]
})
export class ExtensionComponent implements OnInit, EditingComponent {

  @ViewChild('tabSet') tabSet: NgbTabset;

  extension: Extension;
  extensionScheme: ExtensionScheme;

  constructor(private userService: UserService,
              private dataService: DataService,
              private route: ActivatedRoute,
              private router: Router,
              private locationService: LocationService,
              private editableService: EditableService,
              private confirmationModalService: CodeListConfirmationModalService,
              private errorModalService: CodeListErrorModalService,
              private authorizationManager: AuthorizationManager,
              private languageService: LanguageService) {

    editableService.onSave = (formValue: any) => this.save(formValue);
  }

  ngOnInit() {

    const registryCodeValue = this.route.snapshot.params.registryCode;
    const schemeCodeValue = this.route.snapshot.params.schemeCode;
    const extensionSchemeCodeValue = this.route.snapshot.params.extensionSchemeCode;
    const extensionId = this.route.snapshot.params.extensionId;

    if (!extensionId || !registryCodeValue || !schemeCodeValue || !extensionSchemeCodeValue) {
      throw new Error(`Illegal route, extensionId: '${extensionId}', registry: '${registryCodeValue}', ` +
        `scheme: '${schemeCodeValue}', extensionScheme: '${extensionSchemeCodeValue}'`);
    }

    this.dataService.getExtension(extensionId).subscribe(extension => {
      this.extension = extension;
      this.locationService.atExtensionPage(extension);
    });

    this.dataService.getExtensionScheme(registryCodeValue, schemeCodeValue, extensionSchemeCodeValue).subscribe(extensionScheme => {
      this.extensionScheme = extensionScheme;
    });
  }

  get loading(): boolean {
    return this.extension == null || this.extensionScheme == null;
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
    this.router.navigate(this.extensionScheme.route);
  }

  isEditing(): boolean {
    return this.editableService.editing;
  }

  get canDelete() {
    return this.userService.user.superuser ||
      (this.authorizationManager.canDelete(this.extensionScheme.parentCodeScheme) &&
        (this.extensionScheme.status === 'DRAFT' ||
          this.extensionScheme.status === 'SUGGESTED' ||
          this.extensionScheme.status === 'SUBMITTED'));
  }

  get isSuperUser() {
    return this.userService.user.superuser;
  }

  get restricted() {
    if (this.isSuperUser) {
      return false;
    }
    return this.extensionScheme.restricted;
  }

  delete() {
    this.confirmationModalService.openRemoveExtension()
      .then(() => {
        this.dataService.deleteExtension(this.extension).subscribe(res => {
          this.router.navigate(this.extension.extensionScheme.route);
        }, error => {
          this.errorModalService.openSubmitError(error);
        });
      }, ignoreModalClose);
  }

  cancelEditing(): void {
    this.editableService.cancel();
  }

  save(formData: any): Observable<any> {

    console.log('Store Code changes to server!');

    const {...rest} = formData;
    const updatedCode = this.extension.clone();

    Object.assign(updatedCode, {
      ...rest,
    });

    return this.dataService.saveExtension(updatedCode.serialize()).do(() => this.ngOnInit());
  }
}
