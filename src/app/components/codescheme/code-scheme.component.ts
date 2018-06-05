import { Component, OnInit, ViewChild } from '@angular/core';
import { CodeScheme } from '../../entities/code-scheme';
import { DataService } from '../../services/data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LocationService } from '../../services/location.service';
import { EditableService, EditingComponent } from '../../services/editable.service';
import { NgbTabChangeEvent, NgbTabset } from '@ng-bootstrap/ng-bootstrap';
import { ignoreModalClose } from 'yti-common-ui//utils/modal';
import { Observable } from 'rxjs/Observable';
import { LanguageService } from '../../services/language.service';
import { CodePlain } from '../../entities/code-simple';
import { UserService } from 'yti-common-ui/services/user.service';
import { CodeListConfirmationModalService } from '../common/confirmation-modal.service';
import { CodeListErrorModalService } from '../common/error-modal.service';
import { AuthorizationManager } from '../../services/authorization-manager.service';

@Component({
  selector: 'app-code-scheme',
  templateUrl: './code-scheme.component.html',
  styleUrls: ['./code-scheme.component.scss'],
  providers: [EditableService],
})
export class CodeSchemeComponent implements OnInit, EditingComponent {

  @ViewChild('tabSet') tabSet: NgbTabset;

  codeScheme: CodeScheme;
  codes: CodePlain[];
  dev: boolean;

  constructor(private userService: UserService,
              private dataService: DataService,
              private route: ActivatedRoute,
              private router: Router,
              private locationService: LocationService,
              public languageService: LanguageService,
              private editableService: EditableService,
              private confirmationModalService: CodeListConfirmationModalService,
              private errorModalService: CodeListErrorModalService,
              private authorizationManager: AuthorizationManager) {

    editableService.onSave = (formValue: any) => this.save(formValue);

    dataService.getServiceConfiguration().subscribe(configuration => {
      this.dev = configuration.dev;
    });
  }

  ngOnInit() {

    const registryCode = this.route.snapshot.params.registryCode;
    const schemeCode = this.route.snapshot.params.schemeCode;

    if (!registryCode || !schemeCode) {
      throw new Error(`Illegal route, registry: '${registryCode}', scheme: '${schemeCode}'`);
    }

    this.dataService.getCodeScheme(registryCode, schemeCode).subscribe(codeScheme => {
      this.codeScheme = codeScheme;
      this.locationService.atCodeSchemePage(codeScheme);
    });

    this.dataService.getPlainCodes(registryCode, schemeCode).subscribe(codes => {
      this.codes = codes;
    });
  }

  refreshCodes() {
    this.dataService.getPlainCodes(this.codeScheme.codeRegistry.codeValue, this.codeScheme.codeValue).subscribe(codes => {
      this.codes = codes;
    });
  }

  get loading(): boolean {
    return this.codeScheme == null || this.codes == null;
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
    this.router.navigate(['frontpage']);
  }

  isEditing(): boolean {
    return this.editableService.editing;
  }

  get canDelete() {
    return this.userService.user.superuser || (this.authorizationManager.canDelete(this.codeScheme) &&
      (this.codeScheme.status === 'DRAFT' || this.codeScheme.status === 'SUGGESTED' || this.codeScheme.status === 'SUBMITTED'));
  }

  get isSuperUser() {
    return this.userService.user.superuser;
  }

  delete() {
    this.confirmationModalService.openRemoveCodeScheme()
      .then(() => {
        this.dataService.deleteCodeScheme(this.codeScheme).subscribe(res => {
          this.router.navigate(['frontpage']);
        }, error => {
          this.errorModalService.openSubmitError(error);
        });
      }, ignoreModalClose);
  }

  get restricted(): boolean {
    if (this.isSuperUser) {
      return false;
    }
    return this.codeScheme.restricted;
  }

  cancelEditing(): void {
    this.editableService.cancel();
  }

  save(formData: any): Observable<any> {

    console.log('Store CodeScheme changes to server!');

    const {validity, ...rest} = formData;
    const updatedCodeScheme = this.codeScheme.clone();

    Object.assign(updatedCodeScheme, {
      ...rest,
      startDate: validity.start,
      endDate: validity.end
    });

    return this.dataService.saveCodeScheme(updatedCodeScheme.serialize()).do(() => this.ngOnInit());
  }

  copyTheCodescheme() {
    console.log('Copy codescheme clicked!');
    this.router.navigate(['createcodescheme'], { queryParams: {'originalCodeSchemeId': this.codeScheme.id}});
  }

  get isDev() {
    return this.dev;
  }
}
