import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Component, Input } from '@angular/core';
import { EditableService } from '../../services/editable.service';
import { ExternalReference } from '../../entities/external-reference';

@Component({
  selector: 'app-link-list-modal',
  templateUrl: './link-list-modal.component.html',
  providers: [EditableService]
})
export class LinkListModalComponent {

  @Input() externalReferences: ExternalReference[];
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
}
