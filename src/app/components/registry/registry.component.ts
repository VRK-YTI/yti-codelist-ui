import { Component, OnInit, ViewChild } from '@angular/core';
import { CodeScheme } from '../../entities/code-scheme';
import { DataService } from '../../services/data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LocationService } from '../../services/location.service';
import { EditableService, EditingComponent } from '../../services/editable.service';
import { NgbNav, NgbNavChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { ignoreModalClose } from 'yti-common-ui//utils/modal';
import { Observable } from 'rxjs';
import { LanguageService } from '../../services/language.service';
import { UserService } from 'yti-common-ui/services/user.service';
import { CodeListConfirmationModalService } from '../common/confirmation-modal.service';
import { CodeListErrorModalService } from '../common/error-modal.service';
import { CodeRegistry } from '../../entities/code-registry';
import { tap } from 'rxjs/operators';
import { AlertModalService } from 'yti-common-ui/components/alert-modal.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-code-registry',
  templateUrl: './registry.component.html',
  styleUrls: ['./registry.component.scss'],
  providers: [EditableService],
})
export class RegistryComponent implements OnInit, EditingComponent {

  // @ViewChild('tabSet') tabSet: NgbTabset;
  @ViewChild('nav') nav: NgbNav;

  codeRegistry: CodeRegistry;
  codeSchemes: CodeScheme[];

  constructor(private userService: UserService,
              private dataService: DataService,
              private route: ActivatedRoute,
              private router: Router,
              private locationService: LocationService,
              public languageService: LanguageService,
              private editableService: EditableService,
              private confirmationModalService: CodeListConfirmationModalService,
              private errorModalService: CodeListErrorModalService,
              private alertModalService: AlertModalService,
              private translateService: TranslateService) {

    editableService.onSave = (formValue: any) => this.save(formValue);
  }

  ngOnInit() {

    const registryCodeValue = this.route.snapshot.params.registryCode;

    if (!registryCodeValue) {
      throw new Error(`Illegal route, registry: '${registryCodeValue}'`);
    }

    this.dataService.getCodeRegistry(registryCodeValue).subscribe(codeRegistry => {
      this.codeRegistry = codeRegistry;
      this.locationService.atRegistryPage(codeRegistry);
    }, error => { // in case the user comes thru an old broken URL, redirect here to frontpage.
      this.alertModalService.openWithMessageAndTitleAndShowOkButtonAndReturnPromise('MISSING_RESOURCE', this.translateService.instant('REDIRECTING_TO_FRONT_PAGE')).then(value => {
        this.goToFrontPage();
      }).catch(() => {
        this.goToFrontPage();
      })});

    this.dataService.getCodeSchemesForCodeRegistry(registryCodeValue).subscribe(codeSchemes => {
      this.codeSchemes = codeSchemes;
    });
  }

  goToFrontPage() {
    this.locationService.atFrontPage();
    this.router.navigate(['']);
  }

  get loading(): boolean {
    return this.codeRegistry == null || this.codeSchemes == null;
  }

  onNavChange(event: NgbNavChangeEvent) {

    if (this.isEditing()) {
      event.preventDefault();

      this.confirmationModalService.openEditInProgress()
        .then(() => {
          this.cancelEditing();
          this.nav.activeId = event.nextId;
        }, ignoreModalClose);
    }
  }

  isEditing(): boolean {
    return this.editableService.editing;
  }

  get canDelete() {
    return this.userService.user.superuser;
  }

  get isSuperUser(): boolean {
    return this.userService.user.superuser;
  }

  delete() {
    this.confirmationModalService.openRemoveCodeRegistry()
      .then(() => {
        this.dataService.deleteCodeRegistry(this.codeRegistry).subscribe(res => {
          if (res.meta.code === 200) {
            this.router.navigate(['frontpage']);
          } else {
            this.errorModalService.openSubmitError(res);
          }
        }, error => {
          this.errorModalService.openSubmitError(error);
        });
      }, ignoreModalClose);
  }

  cancelEditing(): void {
    this.editableService.cancel();
  }

  save(formData: any): Observable<any> {

    const {...rest} = formData;
    const updatedCodeRegistry = this.codeRegistry.clone();

    Object.assign(updatedCodeRegistry, {
      ...rest
    });

    return this.dataService.saveCodeRegistry(updatedCodeRegistry.serialize()).pipe(tap(() => this.ngOnInit()));
  }
}
