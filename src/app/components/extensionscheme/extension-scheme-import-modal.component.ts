import { Component, Injectable, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { EditableService } from '../../services/editable.service';
import { DataService } from '../../services/data.service';
import { CodeScheme } from '../../entities/code-scheme';
import { ModalService } from '../../services/modal.service';
import { CodeListErrorModalService } from '../../components/common/error-modal.service';

@Injectable()
export class ExtensionSchemesImportModalService {

  constructor(private modalService: ModalService) {
  }

  public open(codeScheme: CodeScheme): Promise<boolean> {
    const modalRef = this.modalService.open(ExtensionSchemesImportModalComponent, {size: 'sm'});
    const instance = modalRef.componentInstance as ExtensionSchemesImportModalComponent;
    instance.codeScheme = codeScheme;
    return modalRef.result;
  }
}

@Component({
  selector: 'app-extension-scheme-import-modal',
  templateUrl: './extension-scheme-import-modal.component.html',
  providers: [EditableService]
})
export class ExtensionSchemesImportModalComponent {

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
    console.log(this.file);
  }

  uploadExtensionSchemesFile() {
    if (!this.file) {
      throw new Error('File must be set');
    }
    console.log('uploadExtensionSchemesFile');
    if (this.file !== undefined) {
      this.uploading = true;

      this.dataService.uploadExtensionSchemes(
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
