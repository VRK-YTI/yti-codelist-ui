import { AfterContentInit, Component, Injectable, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { EditableService } from '../../services/editable.service';
import { DataService } from '../../services/data.service';
import { CodeRegistry } from '../../entities/code-registry';
import { Router } from '@angular/router';
import { ModalService } from '../../services/modal.service';
import { CodeListErrorModalService } from '../common/error-modal.service';
import { CodeScheme } from '../../entities/code-scheme';
import { UserService } from 'yti-common-ui/services/user.service';
import { allStatuses, Status } from 'yti-common-ui/entities/status';
import { FilterOptions } from 'yti-common-ui/components/filter-dropdown.component';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { AlertModalService } from '../common/alert-modal.service';

@Component({
  selector: 'app-code-scheme-mass-migrate-code-statuses-modal',
  templateUrl: './code-scheme-mass-migrate-code-statuses-modal.html',
  providers: [EditableService]
})
export class CodeSchemeMassMigrateCodeStatusesModalComponent implements AfterContentInit, OnInit {

  codeRegistry: CodeRegistry | null = null;
  file?: File;
  fromOptions: FilterOptions<Status>;
  toOptions: FilterOptions<Status>;
  fromStatus$ = new BehaviorSubject<Status | null>(null);
  toStatus$ = new BehaviorSubject<Status | null>(null);
  uploading = false;
  codeRegistriesLoaded = false;
  codeScheme: CodeScheme;

  fromStatuses = ['INCOMPLETE', 'DRAFT', 'VALID', 'RETIRED', 'INVALID'] as Status[];
  toStatuses = ['INCOMPLETE', 'DRAFT', 'VALID', 'RETIRED', 'INVALID'] as Status[];


  allowedTargetStatusesFrom_INCOMPLETE = ['DRAFT'] as Status[];
  allowedTargetStatusesFrom_DRAFT = ['INCOMPLETE', 'VALID'] as Status[];
  allowedTargetStatusesFrom_VALID = ['RETIRED', 'INVALID'] as Status[];
  allowedTargetStatusesFrom_RETIRED = ['VALID', 'INVALID'] as Status[];
  allowedTargetStatusesFrom_INVALID = ['VALID', 'RETIRED'] as Status[];

  enforceTransitionRulesForSuperUserToo = false;

  constructor(private editableService: EditableService,
              private dataService: DataService,
              private router: Router,
              private modal: NgbActiveModal,
              private errorModalService: CodeListErrorModalService,
              private userService: UserService,
              private translateService: TranslateService,
              private alertModalService: AlertModalService) {

    this.editableService.edit();
  }

  ngOnInit() {
    // this.reset();
    this.reset();
  }


  get isSuperUser() {
    return this.userService.user.superuser;
  }

  get restricted(): boolean {
    if (this.isSuperUser) {
      return false;
    }
    return true;
  }

  ngAfterContentInit() {
    if (this.codeScheme != null) {
      this.codeRegistry = this.codeScheme.codeRegistry;
    }
    this.codeRegistriesLoaded = true;
  }

  get loading(): boolean {
    return !this.codeRegistriesLoaded || this.uploading;
  }

  close() {
    this.modal.dismiss('cancel');
  }

  canSave() {
    return this.fromStatus$.value != null && this.toStatus$.value != null;
  }

  onChange(event: EventTarget) {
    // nothing for now
  }

  saveChanges() {
    if (!this.codeRegistry) {
      throw new Error('Code registry must be set');
    }

    const modalRef = this.alertModalService.open('Please wait. This could take a while...');

    this.dataService.createCodes([], this.codeRegistry.codeValue, this.codeScheme.codeValue, this.fromStatus$.value, this.toStatus$.value).subscribe(next => {
      let messagePart = '';
      const nrOfCodesWithStatusChanged: number = next.length;
      if (nrOfCodesWithStatusChanged === 0) {
        messagePart = this.translateService.instant('No codes were found with the starting status. No changes to code statuses.');
      } else if (nrOfCodesWithStatusChanged === 1) {
        messagePart = this.translateService.instant('Status changed to one code.');
        modalRef.message = '' + nrOfCodesWithStatusChanged + messagePart;
      } else {
        const messagePart1 = this.translateService.instant('Status changed to ');
        const messagePart2 = this.translateService.instant(' codes.');
        messagePart = messagePart1 + nrOfCodesWithStatusChanged + messagePart2;
      }
      modalRef.message = messagePart;
      this.modal.close(false);
    }, error => {
      this.uploading = false;
      this.errorModalService.openSubmitError(error);
      modalRef.cancel();
    });
  }

  toggleEnforceTransitionRulesForSuperUserToo() {
    this.enforceTransitionRulesForSuperUserToo = !this.enforceTransitionRulesForSuperUserToo;
    this.reset();
  }

  reset() {
    this.toStatus$.next(null);
    this.fromStatus$.next(null);

    if (!this.isSuperUser) {

      this.fromOptions = [null, ...this.fromStatuses].map(status => ({
        value: status,
        name: () => this.translateService.instant(status ? status : 'Choose starting status'),
        idIdentifier: () => status ? status : 'all_selected'
      }));

      this.toOptions = [null, ...this.toStatuses].map(stat => ({
        value: stat,
        name: () => this.translateService.instant(stat ? stat : 'Choose target status'),
        idIdentifier: () => stat ? stat : 'all_selected'
      }));

      combineLatest(this.fromStatus$, this.toStatus$).subscribe(
        ([fromStatus, toStatus]) => {

          // handle restrictions to values in dropdowns
          if (fromStatus === null) {
            return;
          } else {
            const chosenFromStatus: Status | null = fromStatus;

            if (chosenFromStatus === 'INCOMPLETE') {
              this.toOptions = [null, ...this.allowedTargetStatusesFrom_INCOMPLETE].map(stat => ({
                value: stat,
                name: () => this.translateService.instant(stat ? stat : 'Choose target status'),
                idIdentifier: () => stat ? stat : 'all_selected'
              }));
            } else if (chosenFromStatus === 'DRAFT') {
              this.toOptions = [null, ...this.allowedTargetStatusesFrom_DRAFT].map(stat => ({
                value: stat,
                name: () => this.translateService.instant(stat ? stat : 'Choose target status'),
                idIdentifier: () => stat ? stat : 'all_selected'
              }));
            } else if (chosenFromStatus === 'VALID') {
              this.toOptions = [null, ...this.allowedTargetStatusesFrom_VALID].map(stat => ({
                value: stat,
                name: () => this.translateService.instant(stat ? stat : 'Choose target status'),
                idIdentifier: () => stat ? stat : 'all_selected'
              }));
            } else if (chosenFromStatus === 'RETIRED') {
              this.toOptions = [null, ...this.allowedTargetStatusesFrom_RETIRED].map(stat => ({
                value: stat,
                name: () => this.translateService.instant(stat ? stat : 'Choose target status'),
                idIdentifier: () => stat ? stat : 'all_selected'
              }));
            } else if (chosenFromStatus === 'INVALID') {
              this.toOptions = [null, ...this.allowedTargetStatusesFrom_INVALID].map(stat => ({
                value: stat,
                name: () => this.translateService.instant(stat ? stat : 'Choose target status'),
                idIdentifier: () => stat ? stat : 'all_selected'
              }));
            } else if (chosenFromStatus === null) {
              this.toOptions = [null, ...this.toStatuses].map(stat => ({
                value: stat,
                name: () => this.translateService.instant(stat ? stat : 'Choose target status'),
                idIdentifier: () => stat ? stat : 'all_selected'
              }));
            }
          }
        }
      );
    } else if (this.isSuperUser) {

      if (this.enforceTransitionRulesForSuperUserToo) {


        this.fromOptions = [null, ...this.fromStatuses].map(status => ({
          value: status,
          name: () => this.translateService.instant(status ? status : 'Choose starting status'),
          idIdentifier: () => status ? status : 'all_selected'
        }));

        this.toOptions = [null, ...this.toStatuses].map(stat => ({
          value: stat,
          name: () => this.translateService.instant(stat ? stat : 'Choose target status'),
          idIdentifier: () => stat ? stat : 'all_selected'
        }));

        combineLatest(this.fromStatus$, this.toStatus$).subscribe(
          ([fromStatus, toStatus]) => {

            // handle restrictions to values in dropdowns
            if (fromStatus === null) {
              return;
            } else {
              const chosenFromStatus: Status | null = fromStatus;

              if (chosenFromStatus === 'INCOMPLETE') {
                this.toOptions = [null, ...this.allowedTargetStatusesFrom_INCOMPLETE].map(stat => ({
                  value: stat,
                  name: () => this.translateService.instant(stat ? stat : 'Choose target status'),
                  idIdentifier: () => stat ? stat : 'all_selected'
                }));
              } else if (chosenFromStatus === 'DRAFT') {
                this.toOptions = [null, ...this.allowedTargetStatusesFrom_DRAFT].map(stat => ({
                  value: stat,
                  name: () => this.translateService.instant(stat ? stat : 'Choose target status'),
                  idIdentifier: () => stat ? stat : 'all_selected'
                }));
              } else if (chosenFromStatus === 'VALID') {
                this.toOptions = [null, ...this.allowedTargetStatusesFrom_VALID].map(stat => ({
                  value: stat,
                  name: () => this.translateService.instant(stat ? stat : 'Choose target status'),
                  idIdentifier: () => stat ? stat : 'all_selected'
                }));
              } else if (chosenFromStatus === 'RETIRED') {
                this.toOptions = [null, ...this.allowedTargetStatusesFrom_RETIRED].map(stat => ({
                  value: stat,
                  name: () => this.translateService.instant(stat ? stat : 'Choose target status'),
                  idIdentifier: () => stat ? stat : 'all_selected'
                }));
              } else if (chosenFromStatus === 'INVALID') {
                this.toOptions = [null, ...this.allowedTargetStatusesFrom_INVALID].map(stat => ({
                  value: stat,
                  name: () => this.translateService.instant(stat ? stat : 'Choose target status'),
                  idIdentifier: () => stat ? stat : 'all_selected'
                }));
              } else if (chosenFromStatus === null) {
                this.toOptions = [null, ...this.toStatuses].map(stat => ({
                  value: stat,
                  name: () => this.translateService.instant(stat ? stat : 'Choose target status'),
                  idIdentifier: () => stat ? stat : 'all_selected'
                }));
              }
            }
          }
        );

      } else {

        this.fromOptions = [null, ...allStatuses].map(status => ({
          value: status,
          name: () => this.translateService.instant(status ? status : 'Choose starting status'),
          idIdentifier: () => status ? status : 'all_selected'
        }));

        this.toOptions = [null, ...allStatuses].map(stat => ({
          value: stat,
          name: () => this.translateService.instant(stat ? stat : 'Choose target status'),
          idIdentifier: () => stat ? stat : 'all_selected'
        }));

      }

    } else {
      throw new Error('Wrong branch in logic error! Should never end up here.');
    }


  }
}

@Injectable()
export class CodeSchemeMassMigrateCodeStatusesModalService {

  constructor(private modalService: ModalService) {
  }

  public open(codeScheme: CodeScheme): Promise<CodeScheme> {
    const modalRef = this.modalService.open(CodeSchemeMassMigrateCodeStatusesModalComponent, { size: 'sm', backdrop: 'static', keyboard: false });
    const instance = modalRef.componentInstance as CodeSchemeMassMigrateCodeStatusesModalComponent;
    instance.codeScheme = codeScheme;
    return modalRef.result;
  }
}
