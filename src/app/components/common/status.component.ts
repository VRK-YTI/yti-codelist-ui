import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-status',
  styleUrls: ['./status.component.scss'],
  template: `
    <span [class.bg-danger]="danger"
          [class.bg-warning]="warning"
          [class.bg-info]="info"
          [class.bg-success]="success">{{status | translate}}</span>
  `
})
export class StatusComponent {

  @Input() status: string;

  get danger() {
    return this.status === 'RETIRED' || this.status === 'INVALID';
  }

  get warning() {
    return this.status === 'SUPERSEDED' || this.status === 'SUBMITTED';
  }

  get info() {
    return this.status === 'DRAFT';
  }

  get success() {
    return this.status === 'VALID';
  }
}
