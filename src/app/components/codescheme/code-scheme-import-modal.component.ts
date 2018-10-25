import { Component, Injectable, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { EditableService } from '../../services/editable.service';
import { DataService } from '../../services/data.service';
import { CodeRegistry } from '../../entities/code-registry';
import { Router } from '@angular/router';
import { ModalService } from '../../services/modal.service';
import { CodeListErrorModalService } from '../common/error-modal.service';

@Component({
  selector: 'app-code-scheme-import-modal',
  templateUrl: './code-scheme-import-modal.component.html',
  providers: [EditableService]
})
export class CodeSchemeImportModalComponent {

  codeRegistry: CodeRegistry | null = null;
  file?: File;
  format = 'Excel';
  uploading = false;
  codeRegistriesLoaded = false;
  creatingNewCodeSchemeVersion = false;
  originalCodeSchemeIdIfCreatingNewVersion: string;

  constructor(private editableService: EditableService,
              private dataService: DataService,
              private router: Router,
              private modal: NgbActiveModal,
              private errorModalService: CodeListErrorModalService) {

    this.editableService.edit();
  }

  get loading(): boolean {
    return !this.codeRegistriesLoaded || this.uploading;
  }

  close() {
    this.modal.dismiss('cancel');
  }

  canSave() {
    return this.codeRegistry != null && this.file != null;
  }

  onChange(event: EventTarget) {
    const eventObj: MSInputMethodContext = <MSInputMethodContext> event;
    const target: HTMLInputElement = <HTMLInputElement> eventObj.target;
    if (target.files != null) {
      this.file = target.files[0];
    } else {
      this.file = undefined;
    }
    console.log(this.file);
  }

  uploadFile() {

    if (!this.file || !this.codeRegistry) {
      throw new Error('File and code registry must be set');
    }
    console.log('uploadFile');

    this.uploading = true;
    let okToImportFromVersionPerspective = true;
    let validationPassedForNewCodeVersionCreation;

    this.dataService.validateNewCodeSchemeVersionCreationThruFile(this.codeRegistry.codeValue, this.file, this.format).subscribe( (next) => {
      validationPassedForNewCodeVersionCreation = next.body;
      if (this.creatingNewCodeSchemeVersion && !validationPassedForNewCodeVersionCreation) {
        okToImportFromVersionPerspective = false;
      }
      if (this.file != null && this.codeRegistry != null && okToImportFromVersionPerspective) {
        this.dataService.uploadCodeSchemes(this.codeRegistry.codeValue, this.file, this.format, this.creatingNewCodeSchemeVersion, this.originalCodeSchemeIdIfCreatingNewVersion).subscribe(codeSchemes => {
          if (this.creatingNewCodeSchemeVersion) {
            this.router.navigate(['re'], {skipLocationChange: true}).then(() => this.router.navigate(codeSchemes[0].route));
            this.modal.close(false);
          } else {
            if (codeSchemes.length === 1) {
              this.router.navigate(codeSchemes[0].route);
              this.modal.close(false);
            } else if (codeSchemes.length > 1) {
              this.router.navigate(['frontpage']);
              this.modal.close(false);
            }
          }
        }, error => {
          this.uploading = false;
          this.errorModalService.openSubmitError(error);
        });
      } else {
        if (this.creatingNewCodeSchemeVersion ) {
          this.uploading = false;
          this.errorModalService.openSubmitError('UNSUITABLE DATA!');
        } else {
          this.uploading = false;
          this.errorModalService.openSubmitError('UNSUITABLE DATA!');
        }
      }
    }, (error) => {
      this.uploading = false;
      this.errorModalService.openSubmitError(error);
    });

  }
}

@Injectable()
export class CodeSchemeImportModalService {

  constructor(private modalService: ModalService) {
  }

  public open(creatingNewCodeSchemeVersion: boolean = false, originalCodeSchemeIdIfCreatingNewVersion: string): void {
    console.log('in open service creatingNewCodeScheneParan is ' , creatingNewCodeSchemeVersion);
    const modalRef = this.modalService.open(CodeSchemeImportModalComponent, {size: 'sm'});
    const instance = modalRef.componentInstance as CodeSchemeImportModalComponent;
    instance.creatingNewCodeSchemeVersion = creatingNewCodeSchemeVersion;
    instance.originalCodeSchemeIdIfCreatingNewVersion = originalCodeSchemeIdIfCreatingNewVersion;
  }
}
