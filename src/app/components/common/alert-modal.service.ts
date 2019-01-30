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
        <a><i id="close_alert_modal_link" class="fa fa-times" (click)="cancel()"></i></a>
      </h4>
    </div>
    <div class="modal-body">
      <app-ajax-loading-indicator *ngIf="message === undefined"></app-ajax-loading-indicator>
      <span *ngIf="message !== undefined">{{message}}</span>
    </div>
  `
})
export class AlertModalComponent {

  @Input() title: string;
  @Input() message: string;

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
