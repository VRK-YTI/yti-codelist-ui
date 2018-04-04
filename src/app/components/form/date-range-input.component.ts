import { Component, Input, Optional, Self } from '@angular/core';
import { EditableService } from '../../services/editable.service';
import { FormControl, NgControl } from '@angular/forms';
import { DateRange, formatDisplayDate, validDate } from '../../utils/date';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-date-range-input',
  template: `
    <dl *ngIf="show">
      <dt>
        <label>{{label}}</label>
      </dt>
      <dd>
        <div *ngIf="editing">

          <div class="row">
            <div class="col-md-6">
              <app-date-input [id]="'start_date_input'" [label]="'Start date' | translate" [formControl]="startControl"></app-date-input>
            </div>
            
            <div class="col-md-6">
              <app-date-input [id]="'end_date_input'" [label]="'End date' | translate" [formControl]="endControl"></app-date-input>
            </div>
          </div>
          
          <app-error-messages [control]="parentControl"></app-error-messages>
        </div>

        <span *ngIf="!editing">{{displayName}}</span>
      </dd>
    </dl>
  `
})
export class DateRangeInputComponent {

  @Input() label: string;
  @Input() restrict = false;

  startControl = new FormControl(null, validDate);
  endControl = new FormControl(null, validDate);

  private propagateChange: (fn: any) => void = () => {};
  private propagateTouched: (fn: any) => void = () => {};

  constructor(@Self() @Optional() public parentControl: NgControl,
              private editableService: EditableService) {

    Observable.combineLatest(this.startControl.valueChanges, this.endControl.valueChanges)
      .subscribe(() => this.propagateChange(this.value));

    if (parentControl) {
      parentControl.valueAccessor = this;
    }
  }

  get show() {
    return this.editing || this.displayName;
  }

  get editing() {
    return this.editableService.editing && !this.restrict;
  }

  get invalid() {
    return this.invalidStart || this.invalidEnd;
  }

  get invalidStart() {
    return this.startControl.value === undefined;
  }

  get invalidEnd() {
    return this.endControl.value === undefined;
  }

  get displayName() {

    const value = this.value;

    if (!value) {
      return '';
    } else {
      const start = formatDisplayDate(value.start);
      const end = formatDisplayDate(value.end);
      return (start || end) ? start + ' - ' + end : '';
    }
  }

  get value(): DateRange|undefined {

    if (this.invalid) {
      return undefined;
    }

    return {
      start: this.startControl.value,
      end: this.endControl.value
    };
  }

  writeValue(obj: DateRange): void {
    this.startControl.setValue(obj ? obj.start : null);
    this.endControl.setValue(obj ? obj.end : null);
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.propagateTouched = fn;
  }
}
