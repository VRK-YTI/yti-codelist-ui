import { Component, forwardRef, Input } from '@angular/core';
import { EditableService } from '../../services/editable.service';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-literal-input',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => LiteralInputComponent),
    multi: true
  }],
  template: `
    <dl *ngIf="show">
      <dt><label>{{label}}</label></dt>
      <dd>
        <div *ngIf="editing" class="form-group">
          <input type="text" class="form-control" [formControl]="control" />
        </div>
        <span *ngIf="!editing">{{control.value}}</span>
      </dd>
    </dl>
  `
})
export class LiteralInputComponent implements ControlValueAccessor {

  @Input() label: string;

  control = new FormControl();

  private propagateChange: (fn: any) => void = () => {};
  private propagateTouched: (fn: any) => void = () => {};

  constructor(private editableService: EditableService) {
    this.control.valueChanges.subscribe(x => this.propagateChange(x));
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
