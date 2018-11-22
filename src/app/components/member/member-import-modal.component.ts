import { Component, Injectable, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { EditableService } from '../../services/editable.service';
import { DataService } from '../../services/data.service';
import { Router } from '@angular/router';
import { ModalService } from '../../services/modal.service';
import { CodeListErrorModalService } from '../common/error-modal.service';
import { Extension } from '../../entities/extension';

@Component({
  selector: 'app-member-import-modal',
  templateUrl: './member-import-modal.component.html',
  providers: [EditableService]
})
export class MembersImportModalComponent {

  @Input() extension: Extension;
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
  }

  uploadExtensionsFile() {
    if (!this.file) {
      throw new Error('File must be set');
    }
    if (this.file !== undefined) {
      this.uploading = true;

      this.dataService.uploadMembers(
        this.extension.parentCodeScheme.codeRegistry.codeValue,
        this.extension.parentCodeScheme.codeValue,
        this.extension.codeValue,
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
export class MembersImportModalService {

  constructor(private modalService: ModalService) {
  }

  public open(extension: Extension): Promise<boolean> {
    const modalRef = this.modalService.open(MembersImportModalComponent, {size: 'sm'});
    const instance = modalRef.componentInstance as MembersImportModalComponent;
    instance.extension = extension;
    return modalRef.result;
  }
}
