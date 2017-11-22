import { Component, Injectable, Input } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ExternalReference } from '../../entities/external-reference';
import { EditableService } from '../../services/editable.service';

@Injectable()
export class LinkShowModalService {

  constructor(private modalService: NgbModal) {
  }

  public open(externalReference: ExternalReference): void {
    const modalRef = this.modalService.open(LinkShowModalComponent, {size: 'sm'});
    const instance = modalRef.componentInstance as LinkShowModalComponent;
    instance.link = externalReference;
  }
}

@Component({
  selector: 'app-link-show-modal',
  templateUrl: './link-show-modal.component.html',
  providers: [EditableService]
})
export class LinkShowModalComponent {

  @Input() link: ExternalReference;

  constructor(private modal: NgbActiveModal) {
  }

  close() {
    this.modal.dismiss('cancel');
  }
}
