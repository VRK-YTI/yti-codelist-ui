import { Component, Injectable, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ExternalReference } from '../../entities/external-reference';
import { EditableService } from '../../services/editable.service';
import { ModalService } from '../../services/modal.service';
import { CodePlain } from '../../entities/code-simple';
import { LinkEditModalComponent } from './link-edit-modal.component';

@Component({
  selector: 'app-link-create-modal',
  templateUrl: './link-create-modal.component.html',
  providers: [EditableService]
})
export class LinkCreateModalComponent {

  @Input() languageCodes: CodePlain[];

  externalReference = new ExternalReference();

  constructor(private editableService: EditableService,
              private modal: NgbActiveModal) {

    this.editableService.edit();
  }

  close() {
    this.modal.dismiss('cancel');
  }

  add() {
    this.modal.close(this.externalReference);
  }
}

@Injectable()
export class LinkCreateModalService {

  constructor(private modalService: ModalService) {
  }

  public open(languageCodes: CodePlain[]): Promise<ExternalReference> {
    const modalRef = this.modalService.open(LinkCreateModalComponent, {size: 'sm'});
    const instance = modalRef.componentInstance as LinkCreateModalComponent;
    instance.languageCodes = languageCodes;
    return modalRef.result;
  }
}

