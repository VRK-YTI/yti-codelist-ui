import { FormControl } from '@angular/forms';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-error-messages',
  styleUrls: ['./error-messages.component.scss'],
  template: `
    <div *ngIf="isVisible()">
      <ul class="errors">
        <li [id]="i + '_' + id" *ngFor="let errorKey of errorKeys; let i = index" translate [translateParams]="translateParams(errorKey)">{{errorKey}}</li>
      </ul>      
    </div>
  `
})
export class ErrorMessagesComponent {

  @Input() control: FormControl;
  @Input() id: string;

  isVisible() {
    return this.control && !this.control.valid;
  }

  translateParams(errorKey: string): any {
    const errors = this.control.errors;
    if (errors) {
      const error = errors[errorKey];
      if (error) {
        return error;
      }
      return null;
    }
    return null;
  }

  get errorKeys() {
    return this.control.errors ? Object.keys(this.control.errors) : [];
  }
}
