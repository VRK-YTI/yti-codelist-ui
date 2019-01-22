import { Component, Injectable, Input } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Injectable()
export class AlertModalService {

  constructor(private modalService: NgbModal) {
  }

  open(title: string ): AlertModalComponent {
    const modalRef = this.modalService.open(AlertModalComponent, { size: 'sm', backdrop: 'static', keyboard: false  });
    const instance = modalRef.componentInstance as AlertModalComponent;
    instance.title = title;
    return instance;
  }

}

@Component({
  selector: 'app-alert-modal',
  styleUrls: [],
  template: `
    <div class="modal-header modal-header-warning">
      <h4 class="modal-title">
        <span translate>{{title}}</span>
      </h4>
    </div>
    <div class="modal-body">
      <app-ajax-loading-indicator></app-ajax-loading-indicator>
    </div>
  `
})
export class AlertModalComponent {

  @Input() title: string;

  constructor(private modal: NgbActiveModal) {
  }

  cancel() {
    this.modal.dismiss('cancel');
  }

  confirm() {
    this.modal.close();
  }

  close() {
    this.modal.close();
  }
}
