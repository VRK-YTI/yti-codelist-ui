import { Component, Injectable } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { EditableService } from '../../services/editable.service';
import { DataService } from '../../services/data.service';
import { CodeRegistry } from '../../entities/code-registry';
import { ErrorModel } from '../../entities/error-model';
import { Router } from '@angular/router';
import { ErrorModalService } from 'yti-common-ui/components/error-modal.component';
import { ModalService } from '../../services/modal.service';
import { ApiResponseType } from '../../services/api-schema';
import { LanguageService } from '../../services/language.service';
import { TranslateService } from 'ng2-translate';

@Injectable()
export class CodeSchemeImportModalService {

  constructor(private modalService: ModalService) {
  }

  public open(): void {
    const modalRef = this.modalService.open(CodeSchemeImportModalComponent, {size: 'sm'});
  }
}

@Component({
  selector: 'app-code-scheme-import-modal',
  templateUrl: './code-scheme-import-modal.component.html',
  providers: [EditableService]
})
export class CodeSchemeImportModalComponent {

  codeRegistry: CodeRegistry | null = null;
  file?: File;
  format = 'CSV';
  uploading = false;
  codeRegistriesLoaded = false;

  constructor(private editableService: EditableService,
              private dataService: DataService,
              private router: Router,
              private modal: NgbActiveModal,
              private errorModalService: ErrorModalService,
              private languageService: LanguageService,
              private translateService: TranslateService) {

    this.editableService.edit();
  }

  get loading(): boolean {
    return !this.codeRegistriesLoaded || this.uploading;
  }

  close() {
    this.modal.dismiss('cancel');
  }

  canSave() {
    return this.codeRegistry !== null && this.file !== undefined;
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

    if (this.file !== undefined && this.codeRegistry !== undefined) {
      this.dataService.uploadCodeSchemes(this.codeRegistry.codeValue, this.file, this.format).subscribe(codeSchemes => {
        if (codeSchemes.length > 0) {
          this.router.navigate(codeSchemes[0].route);
          this.modal.close(false);
        }
      }, error => {
        const errorModel: ApiResponseType = <ApiResponseType> error.json();
        this.uploading = false;
        const showDebug = false; // TODO luetaan oikeasti jostain ympäristökonfiguraatiosta
        const errorObject = showDebug ? errorModel : undefined;
        this.errorModalService.open('Submit error', errorModel.meta.message, errorObject);
      });
    }  
  }
}
