import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-status',
  styleUrls: ['./status.component.scss'],
  template: `
    <span [class.bg-danger]="danger"
          [class.bg-pending]="submitted"
          [class.bg-warning]="warning"
          [class.bg-gray]="gray"
          [class.bg-success]="success">{{status | translate}}</span>
  `
})
export class StatusComponent {

  @Input() status: string;

  get gray() {
    return this.status === 'DRAFT';
  }

  get submitted() {
    return this.status === 'SUBMITTED';
  }

  get danger() {
    return this.status === 'RETIRED' || this.status === 'INVALID';
  }

  get warning() {
    return this.status === 'SUPERSEDED';
  }

  get success() {
    return this.status === 'VALID';
  }
}
