import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Component, Injectable, Input } from '@angular/core';
import { EditableService } from '../../services/editable.service';
import { ExternalReference } from '../../entities/external-reference';

@Injectable()
export class LinkListModalService {

  constructor(private modalService: NgbModal) {
  }

  public open(externalReferences: ExternalReference[]): Promise<ExternalReference> {
    const modalRef = this.modalService.open(LinkListModalComponent, {size: 'sm'});
    const instance = modalRef.componentInstance as LinkListModalComponent;
    instance.externalReferences = externalReferences;
    return modalRef.result;
  }
}

@Component({
  selector: 'app-link-list-modal',
  templateUrl: './link-list-modal.component.html',
  providers: [EditableService]
})
export class LinkListModalComponent {

  @Input() externalReferences: ExternalReference[] = [];
  selectedExternalReference: ExternalReference;

  constructor(private modal: NgbActiveModal) {
  }

  close() {
    this.modal.dismiss('cancel');
  }

  select() {
    console.log('Selected value: ' + this.selectedExternalReference.url);
    this.modal.close(this.selectedExternalReference);
  }

  create() {
    this.modal.dismiss('create');
  }

  isChecked(externalReference: ExternalReference) {
    return this.selectedExternalReference && externalReference.url === this.selectedExternalReference.url;
  }

  canSelect() {
    return this.selectedExternalReference != null;
  }
}
