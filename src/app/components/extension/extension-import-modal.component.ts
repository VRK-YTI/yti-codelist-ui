import { Component, Injectable, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { EditableService } from '../../services/editable.service';
import { DataService } from '../../services/data.service';
import { CodeScheme } from '../../entities/code-scheme';
import { ModalService } from '../../services/modal.service';
import { CodeListErrorModalService } from '../common/error-modal.service';

@Component({
  selector: 'app-extension-import-modal',
  templateUrl: './extension-import-modal.component.html',
  providers: [EditableService]
})
export class ExtensionsImportModalComponent {

  @Input() codeScheme: CodeScheme;
  file?: File;
  format = 'Excel';
  uploading = false;

  constructor(private editableService: EditableService,
              private dataService: DataService,
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
  }

  uploadExtensionsFile() {
    if (!this.file) {
      throw new Error('File must be set');
    }
    if (this.file !== undefined) {
      this.uploading = true;

      this.dataService.uploadExtensions(
        this.codeScheme.codeRegistry.codeValue,
        this.codeScheme.codeValue,
        this.file,
        this.format)
        .subscribe(codes => {
          this.modal.close(true);
        }, error => {
          this.uploading = false;
          this.codeListErrorModalService.openSubmitError(error);
        });
    }
  }
}

@Injectable()
export class ExtensionImportModalService {

  constructor(private modalService: ModalService) {
  }

  public open(codeScheme: CodeScheme): Promise<boolean> {
    const modalRef = this.modalService.open(ExtensionsImportModalComponent, {size: 'sm', backdrop: 'static', keyboard: false });
    const instance = modalRef.componentInstance as ExtensionsImportModalComponent;
    instance.codeScheme = codeScheme;
    return modalRef.result;
  }
}
