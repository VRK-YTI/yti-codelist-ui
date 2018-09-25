import { Component, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../../services/data.service';
import { Code } from '../../entities/code';
import { ActivatedRoute, Router } from '@angular/router';
import { LocationService } from '../../services/location.service';
import { EditableService, EditingComponent } from '../../services/editable.service';
import { NgbTabChangeEvent, NgbTabset } from '@ng-bootstrap/ng-bootstrap';
import { ignoreModalClose } from 'yti-common-ui/utils/modal';
import { Observable, from } from 'rxjs';
import { CodeScheme } from '../../entities/code-scheme';
import { UserService } from 'yti-common-ui/services/user.service';
import { CodeListErrorModalService } from '../common/error-modal.service';
import { CodeListConfirmationModalService } from '../common/confirmation-modal.service';
import { AuthorizationManager } from '../../services/authorization-manager.service';
import { LanguageService } from '../../services/language.service';
import { tap, flatMap } from 'rxjs/operators';
import { changeToRestrictedStatus } from '../../utils/status-check';

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

  back() {
    this.router.navigate(this.code.codeScheme.route);
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
        this.codeScheme.status === 'SUGGESTED' ||
        this.codeScheme.status === 'SUBMITTED'));
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

  save(formData: any): Observable<any> {

    const {validity, ...rest} = formData;
    const updatedCode = this.code.clone();

    Object.assign(updatedCode, {
      ...rest,
      startDate: validity.start,
      endDate: validity.end
    });

    const save = () => {
      console.log('Store Code changes to server!');
      return this.dataService.saveCode(updatedCode.serialize()).pipe(tap(() => this.ngOnInit()));
    };

    if (changeToRestrictedStatus(this.code, formData.status)) {
      return from(this.confirmationModalService.openChangeToRestrictedStatus()).pipe(flatMap(save));
    } else {
      return save();
    }
  }
}
