import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-back-button',
  styleUrls: ['./back-button.scss'],
  template: `
    <div class="row">
      <div class="col-12">
        <a (click)="this.back.next()"></a>
      </div>
    </div>
  `
})
export class BackButtonComponent {

  @Output() back = new EventEmitter();
}
