import { Component, Input, Optional, Self } from '@angular/core';
import { EditableService } from '../../services/editable.service';
import { FormControl, NgControl } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { Code } from '../../entities/code';
import { contains } from 'yti-common-ui/utils/array';

@Component({
  selector: 'app-classifications-input',
  template: `
    <dl *ngIf="show">
      <dt>
        <label translate>Classification</label>
      </dt>
      <dd *ngIf="!editing">
        <div *ngFor="let dataClassification of value">
          <span>{{dataClassification.prefLabel | translateValue}}</span><br/>
        </div>
      </dd>
      <dd *ngIf="editing">
        <div ngbDropdown class="d-inline-block">
          <button class="btn btn-dropdown" id="classification-dropdown" ngbDropdownToggle>
            <span *ngIf="!singleValue" translate>No classification</span>
            <span *ngIf="singleValue">{{singleValue.prefLabel | translateValue:true}}</span>
          </button>

          <div ngbDropdownMenu aria-labelledby="classification-dropdown">
            <button *ngFor="let dataClassification of dataClassifications"
                    (click)="singleValue = dataClassification"
                    class="dropdown-item"
                    [class.active]="isClassificationSelected(dataClassification)">
              {{dataClassification.prefLabel | translateValue:true}}
            </button>
          </div>
        </div>
      </dd>
    </dl>
  `
})
export class ClassificationsInputComponent {

  @Input() restrict = false;
  control = new FormControl([]);

  dataClassifications: Code[];

  private propagateChange: (fn: any) => void = () => {};
  private propagateTouched: (fn: any) => void = () => {};

  constructor(@Self() @Optional() public parentControl: NgControl,
              private editableService: EditableService,
              dataService: DataService) {

    this.control.valueChanges.subscribe(x => this.propagateChange(x));

    if (parentControl) {
      parentControl.valueAccessor = this;
    }

    dataService.getDataClassificationsAsCodes().subscribe(dataClassifications => {
      this.dataClassifications = dataClassifications;
    });
  }

  isClassificationSelected(code: Code) {
    return contains(this.value, code, (lhs, rhs) => lhs.id === rhs.id);
  }

  get value(): Code[] {
    return this.control.value;
  }

  set value(classifications: Code[]) {
    this.control.setValue(classifications);
  }

  get singleValue(): Code|null {
    return this.value.length > 0 ? this.value[0] : null;
  }

  set singleValue(classification: Code|null) {
    this.value = classification ? [classification] : [];
  }

  get show() {
    return this.editing || this.control.value.length > 0;
  }

  get editing() {
    return this.editableService.editing && !this.restrict;
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
