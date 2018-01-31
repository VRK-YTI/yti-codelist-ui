import { Component, Injectable } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ExternalReference } from '../../entities/external-reference';
import { EditableService } from '../../services/editable.service';
import { ModalService } from '../../services/modal.service';

@Injectable()
export class LinkCreateModalService {

  constructor(private modalService: ModalService) {
  }

  public open(): Promise<ExternalReference> {
    const modalRef = this.modalService.open(LinkCreateModalComponent, {size: 'sm'});
    return modalRef.result;
  }
}

@Component({
  selector: 'app-link-create-modal',
  templateUrl: './link-create-modal.component.html',
  providers: [EditableService]
})
export class LinkCreateModalComponent {

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
