import { Component, Injectable, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { EditableService } from '../../services/editable.service';
import { DataService } from '../../services/data.service';
import { Router } from '@angular/router';
import { ModalService } from '../../services/modal.service';
import { CodeListErrorModalService } from '../../components/common/error-modal.service';
import { ExtensionScheme } from '../../entities/extension-scheme';

@Injectable()
export class ExtensionSchemeExtensionsImportModalService {

  constructor(private modalService: ModalService) {
  }

  public open(extensionScheme: ExtensionScheme): Promise<boolean> {
    const modalRef = this.modalService.open(ExtensionsImportModalComponent, {size: 'sm'});
    const instance = modalRef.componentInstance as ExtensionsImportModalComponent;
    instance.extensionScheme = extensionScheme;
    return modalRef.result;
  }
}

@Component({
  selector: 'app-extension-import-modal',
  templateUrl: './extension-import-modal.component.html',
  providers: [EditableService]
})
export class ExtensionsImportModalComponent {

  @Input() extensionScheme: ExtensionScheme;
  file?: File;
  format = 'Excel';
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

  uploadExtensionsFile() {
    if (!this.file) {
      throw new Error('File must be set');
    }
    console.log('uploadExtensionSchemesFile');
    if (this.file !== undefined) {
      this.uploading = true;

      this.dataService.uploadExtensions(
        this.extensionScheme.parentCodeScheme.codeRegistry.codeValue,
        this.extensionScheme.parentCodeScheme.codeValue,
        this.extensionScheme.codeValue,
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
