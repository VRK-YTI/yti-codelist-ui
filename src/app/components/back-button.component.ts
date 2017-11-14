import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-back-button',
  styleUrls: ['./app-back-button.scss'],
  template: `
    <div class="row">
      <div class="col-12">
        <button (click)="this.back.next()"></button>
      </div>
    </div>
  `
})
export class BackButtonComponent {

  @Output() back = new EventEmitter();
}
