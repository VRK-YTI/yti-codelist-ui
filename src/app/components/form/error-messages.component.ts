import { FormControl } from '@angular/forms';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-error-messages',
  styleUrls: ['./error-messages.component.scss'],
  template: `
    <div *ngIf="isVisible()">
      <ul class="errors">
        <li *ngFor="let errorKey of errorKeys">{{errorKey | translate}}</li>
      </ul>      
    </div>
  `
})
export class ErrorMessagesComponent {

  @Input() control: FormControl;

  isVisible() {
    return this.control && !this.control.valid;
  }

  get errorKeys() {
    return this.control.errors ? Object.keys(this.control.errors) : [];
  }
}
