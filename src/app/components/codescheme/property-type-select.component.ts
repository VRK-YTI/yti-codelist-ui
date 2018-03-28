import { Component, Optional, Self } from '@angular/core';
import { DataService } from '../../services/data.service';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { PropertyType } from '../../entities/property-type';
import { EditableService } from '../../services/editable.service';

@Component({
  selector: 'app-property-type-select',
  template: `
    <dl>
      <dt><label translate>Link type</label></dt>
      <dd>
        <div *ngIf="editing" class="form-group">
          <div ngbDropdown class="d-inline-block">

            <button class="btn btn-dropdown" id="propertyType-dropdown" ngbDropdownToggle>
              <span *ngIf="value">{{value.prefLabel | translateValue}}</span>
            </button>

            <div ngbDropdownMenu aria-labelledby="propertyType-dropdown">
              <button *ngFor="let propertyTypeOption of propertyTypes"
                      id="{{propertyTypeOption.id + '_propertytype'}}"
                      (click)="select(propertyTypeOption)"
                      class="dropdown-item"
                      [class.active]="isSelected(propertyTypeOption)">
                {{propertyTypeOption.prefLabel | translateValue}}
              </button>
            </div>
          </div>
          <app-error-messages [control]="parentControl"></app-error-messages>
        </div>
        <span *ngIf="!editing">{{value | translateValue}}</span>
      </dd>
    </dl>
  `
})
export class PropertyTypeSelectComponent implements ControlValueAccessor {

  value: PropertyType;
  propertyTypes: PropertyType[];

  private propagateChange: (fn: any) => void = () => {};
  private propagateTouched: (fn: any) => void = () => {};

  constructor(@Self() @Optional() public parentControl: NgControl,
              private editableService: EditableService,
              private dataService: DataService) {

    if (parentControl) {
      parentControl.valueAccessor = this;
    }

    this.dataService.getPropertyTypes('ExternalReference').subscribe(types => {

      if (types.length === 0) {
        throw new Error('No types');
      }

      this.propertyTypes = types;

      if (this.value == null) {
        this.select(types[0]);
      }
    });
  }

  isSelected(propertyType: PropertyType) {
    return this.value && this.value.id === propertyType.id;
  }

  select(propertyType: PropertyType) {
    this.value = propertyType;
    this.propagateChange(propertyType);
  }

  get editing() {
    return this.editableService.editing;
  }

  writeValue(obj: any): void {

    if (obj != null && !(obj instanceof PropertyType)) {
      throw new Error('Object set not a PropertyType');
    }

    this.value = obj;
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.propagateTouched = fn;
  }
}
