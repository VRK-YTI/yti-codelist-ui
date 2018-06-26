import { Component, Input, OnInit, Optional, Self } from '@angular/core';
import { DataService } from '../../services/data.service';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { PropertyType } from '../../entities/property-type';
import { EditableService } from '../../services/editable.service';

@Component({
  selector: 'app-property-type-select',
  template: `
    <dl>
      <dt><label>{{label}}</label></dt>
      <dd>
        <div *ngIf="editing" class="form-group">
          <div ngbDropdown class="d-inline-block">

            <button class="btn btn-dropdown" id="propertytype_dropdown_button" ngbDropdownToggle>
              <span *ngIf="value">{{value.prefLabel | translateValue}}</span>
            </button>

            <div *ngIf="propertyTypes" ngbDropdownMenu aria-labelledby="propertytype_dropdown_button">
              <button *ngFor="let propertyTypeOption of propertyTypes"
                      id="{{propertyTypeOption.idIdentifier + '_propertytype_dropdown_button'}}"
                      (click)="select(propertyTypeOption)"
                      class="dropdown-item"
                      [class.active]="isSelected(propertyTypeOption)">
                {{propertyTypeOption.prefLabel | translateValue}}
              </button>
            </div>
          </div>
          <app-error-messages id="propertytype_error_messages" [control]="parentControl"></app-error-messages>
        </div>
        <span *ngIf="!editing">{{value.prefLabel | translateValue}}</span>
      </dd>
    </dl>
  `
})
export class PropertyTypeSelectComponent implements ControlValueAccessor, OnInit {

  @Input() context: string;
  @Input() label: string;

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
  }

  ngOnInit() {
    console.log('PropertyTypeSelectComponent onInit called!');
    this.dataService.getPropertyTypes(this.context).subscribe(types => {

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
