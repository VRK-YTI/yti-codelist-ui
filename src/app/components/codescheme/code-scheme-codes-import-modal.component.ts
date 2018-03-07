import { Component, Injectable, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { EditableService } from '../../services/editable.service';
import { DataService } from '../../services/data.service';
import { Router } from '@angular/router';
import { CodeScheme } from '../../entities/code-scheme';
import { ModalService } from '../../services/modal.service';
import { ApiResponseType } from '../../services/api-schema';
import { CodeListErrorModalService } from '../../components/common/error-modal.service';

@Injectable()
export class CodeSchemeCodesImportModalService {

  constructor(private modalService: ModalService) {
  }

  public open(codeScheme: CodeScheme): Promise<boolean> {
    const modalRef = this.modalService.open(CodeSchemeCodesImportModalComponent, {size: 'sm'});
    const instance = modalRef.componentInstance as CodeSchemeCodesImportModalComponent;
    instance.codeScheme = codeScheme;
    return modalRef.result;
  }
}

@Component({
  selector: 'app-code-scheme-codes-import-modal',
  templateUrl: './code-scheme-codes-import-modal.component.html',
  providers: [EditableService]
})
export class CodeSchemeCodesImportModalComponent {

  @Input() codeScheme: CodeScheme;
  file?: File;
  format = 'CSV';
  uploading = false;

  constructor(private editableService: EditableService,
              private dataService: DataService,
              private router: Router,
              private modal: NgbActiveModal,
              private codeListErrorModalService: CodeListErrorModalService) {

    this.editableService.edit();
  }

  close() {
    this.modal.dismiss('cancel');
  }

  canSave() {
    return this.file !== undefined;
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

  uploadCodesFile() {
    if (!this.file) {
      throw new Error('File must be set');
    }
    console.log('uploadCodesFile');
    if (this.file !== undefined) {
      this.uploading = true;

      this.dataService.uploadCodes(this.codeScheme.codeRegistry.codeValue, this.codeScheme.id, this.file, this.format).subscribe(codes => {
        this.modal.close(true);
      }, error => {
        this.uploading = false;
        this.codeListErrorModalService.openSubmitError(error);
      });
    }
  }
}
