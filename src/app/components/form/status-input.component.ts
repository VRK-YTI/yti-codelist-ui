import { Component, Input, Optional, Self } from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl } from '@angular/forms';
import { EditableService } from '../../services/editable.service';
import { Status } from 'yti-common-ui/entities/status';

@Component({
  selector: 'app-status-input',
  template: `
    <dl *ngIf="show">
      <dt>
        <label translate>Status</label>
      </dt>
      <dd>
        <span *ngIf="!editing">{{status | translate}}</span>

        <app-status-dropdown *ngIf="editing"
                             [formControl]="control"
                             [restrict]="restrict"></app-status-dropdown>

        <app-error-messages [control]="parentControl"></app-error-messages>
      </dd>
    </dl>
  `
})
export class StatusInputComponent implements ControlValueAccessor {

  @Input() restrict = false;
  control = new FormControl();

  private propagateChange: (fn: any) => void = () => {};
  private propagateTouched: (fn: any) => void = () => {};

  constructor(@Self() @Optional() public parentControl: NgControl,
              private editableService: EditableService) {

    this.control.valueChanges.subscribe(x => this.propagateChange(x));

    if (parentControl) {
      parentControl.valueAccessor = this;
    }
  }

  get status() {
    return this.control.value as Status;
  }

  get show() {
    return this.editing || this.control.value;
  }

  get editing() {
    return this.editableService.editing;
  }

  writeValue(obj: any): void {
    this.control.setValue(obj);
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.propagateTouched = fn;
  }
}
