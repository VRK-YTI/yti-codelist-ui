import { Component, Injectable, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ExternalReference } from '../../entities/external-reference';
import { EditableService } from '../../services/editable.service';
import { ModalService } from '../../services/modal.service';
import { CodePlain } from '../../entities/code-simple';

@Component({
  selector: 'app-link-show-modal',
  templateUrl: './link-show-modal.component.html',
  styleUrls: ['./link-show-modal.component.scss'],
  providers: [EditableService]
})
export class LinkShowModalComponent {

  @Input() externalReference: ExternalReference;
  @Input() languageCodes: CodePlain[];

  constructor(private modal: NgbActiveModal) {
  }

  close() {
    this.modal.dismiss('cancel');
  }
}

@Injectable()
export class LinkShowModalService {

  constructor(private modalService: ModalService) {
  }

  public open(externalReference: ExternalReference, languageCodes: CodePlain[]): void {
    const modalRef = this.modalService.open(LinkShowModalComponent, {size: 'sm'});
    const instance = modalRef.componentInstance as LinkShowModalComponent;
    instance.externalReference = externalReference;
    instance.languageCodes = languageCodes;
  }
}
