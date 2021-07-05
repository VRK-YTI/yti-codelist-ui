import { AfterContentInit, Component, Injectable, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { EditableService } from '../../services/editable.service';
import { DataService } from '../../services/data.service';
import { CodeRegistry } from '../../entities/code-registry';
import { Router } from '@angular/router';
import { CodeListErrorModalService } from '../common/error-modal.service';
import { CodeScheme } from '../../entities/code-scheme';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { CodeListConfirmationModalService } from '../../components/common/confirmation-modal.service';
import { AlertModalService, allowedTargetStatuses, changeToRestrictedStatus, FilterOptions, ignoreModalClose, ModalService, selectableStatuses, Status, UserService } from '@vrk-yti/yti-common-ui';

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

  fromStatuses = ['INCOMPLETE', 'DRAFT', 'VALID', 'SUPERSEDED', 'RETIRED', 'INVALID'] as Status[];
  toStatuses = ['INCOMPLETE', 'DRAFT', 'VALID', 'SUPERSEDED', 'RETIRED', 'INVALID'] as Status[];

  enforceTransitionRulesForSuperUserToo = false;

  constructor(private editableService: EditableService,
              private dataService: DataService,
              private router: Router,
              private modal: NgbActiveModal,
              private errorModalService: CodeListErrorModalService,
              private userService: UserService,
              private translateService: TranslateService,
              private alertModalService: AlertModalService,
              private confirmationModalService: CodeListConfirmationModalService) {

    this.editableService.edit();
  }

  ngOnInit() {
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
    return this.fromStatus$.value != null && this.toStatus$.value != null && (this.fromStatus$.value !== this.toStatus$.value);
  }

  onChange(event: EventTarget) {
    // nothing for now
  }

  saveChanges() {
    const save = () => {
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

    if (changeToRestrictedStatus(this.fromStatus$.value!, this.toStatus$.value!)) {
      this.confirmationModalService.openChangeToRestrictedStatus().then(() => save(), ignoreModalClose);
    } else {
      save();
    }
  }

  toggleEnforceTransitionRulesForSuperUserToo() {
    this.enforceTransitionRulesForSuperUserToo = !this.enforceTransitionRulesForSuperUserToo;
    this.reset();
  }

  reset() {
    this.toStatus$.next(null);
    this.fromStatus$.next(null);

    if (this.isSuperUser && !this.enforceTransitionRulesForSuperUserToo) {
      this.fromOptions = [null, ...selectableStatuses].map(status => ({
        value: status,
        name: () => this.translateService.instant(status ? status : 'Choose starting status'),
        idIdentifier: () => status ? status : 'all_selected'
      }));
      this.toOptions = [null, ...selectableStatuses].map(stat => ({
        value: stat,
        name: () => this.translateService.instant(stat ? stat : 'Choose target status'),
        idIdentifier: () => stat ? stat : 'all_selected'
      }));
    } else if ((this.isSuperUser && this.enforceTransitionRulesForSuperUserToo) || !this.isSuperUser) {
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
    }

    combineLatest(this.fromStatus$, this.toStatus$).subscribe(
      ([fromStatus, toStatus]) => {
        const chosenFromStatus: Status | null = fromStatus;
        const allowedToStatuses = chosenFromStatus ? allowedTargetStatuses(chosenFromStatus, false) : this.toStatuses;

        if (!this.isSuperUser || (this.isSuperUser && this.enforceTransitionRulesForSuperUserToo)) {
          this.toOptions = [null, ...allowedToStatuses].map(stat => ({
            value: stat,
            name: () => this.translateService.instant(stat ? stat : 'Choose target status'),
            idIdentifier: () => stat ? stat : 'all_selected'
          }));
        }
      }
    );
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
