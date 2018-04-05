import { Component, Input, Optional, Self, ViewChild } from '@angular/core';
import { EditableService } from '../../services/editable.service';
import { FormControl, NgControl } from '@angular/forms';
import { NgbInputDatepicker } from '@ng-bootstrap/ng-bootstrap';
import { formatDisplayDate, fromPickerDate, toPickerDate } from '../../utils/date';
import { Moment } from 'moment';

@Component({
  selector: 'app-date-input',
  template: `
    <dl *ngIf="show">
      <dt>
        <label>{{label}}</label>
      </dt>
      <dd>
        <div *ngIf="editing">
          <div class="input-group">
            <input [id]="id"
                   class="form-control"
                   placeholder="yyyy-mm-dd"
                   [formControl]="control"
                   ngbDatepicker
                   #date="ngbDatepicker">
            <button [id]="id + '_toggle_calendar_button'" 
                    class="input-group-addon icon-calendar" 
                    (click)="date.toggle()" 
                    type="button"></button>
          </div>
          <app-error-messages [control]="parentControl"></app-error-messages>
        </div>
        <span *ngIf="!editing">{{displayName}}</span>
      </dd>
    </dl>
  `
})
export class DateInputComponent {

  @ViewChild('date') date: NgbInputDatepicker;

  @Input() label: string;
  @Input() restrict = false;
  @Input() id: string;
  control = new FormControl();

  private propagateChange: (fn: any) => void = () => {};
  private propagateTouched: (fn: any) => void = () => {};

  constructor(@Self() @Optional() public parentControl: NgControl,
              private editableService: EditableService) {

    this.control.valueChanges.subscribe(() => {
      this.propagateChange(this.value);
    });

    if (parentControl) {
      parentControl.valueAccessor = this;
    }
  }

  get show() {
    return this.editing || this.control.value;
  }

  get editing() {
    return this.editableService.editing && !this.restrict;
  }

  get invalid() {
    return typeof this.control.value === 'string';
  }

  get value(): Moment|undefined|null {

    if (this.invalid) {
      return undefined;
    }

    return fromPickerDate(this.control.value);
  }

  get displayName() {
    const value = this.value;
    return value ? formatDisplayDate(value) : '';
  }

  writeValue(obj: Moment|null): void {
    this.control.setValue(toPickerDate(obj));
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.propagateTouched = fn;
  }
}
