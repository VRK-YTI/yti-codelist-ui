import { Component, Input, Optional, Self, OnInit, Output, EventEmitter } from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl } from '@angular/forms';
import { EditableService } from '../../services/editable.service';
import { CodeRegistry } from '../../entities/code-registry';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-coderegistry-input',
  template: `
    <dl *ngIf="show">
      <dt>
        <label translate>Coderegistry</label>
      </dt>
      <dd>
        <div ngbDropdown class="d-inline-block">
          <button class="btn btn-dropdown" id="reg-dropdown" ngbDropdownToggle>
            <span *ngIf="!selection" translate>No registry</span>
            <span *ngIf="selection">{{selection.prefLabel | translateValue:true}}</span>
          </button>

          <div ngbDropdownMenu aria-labelledby="reg-dropdown">
          <button *ngFor="let option of options"
                (click)="select(option)"
                class="dropdown-item"
                [class.active]="isSelected(option)">
              {{option.prefLabel | translateValue:true}}
            </button>
          </div>
          <app-error-messages [control]="parentControl"></app-error-messages>
        </div>
      </dd>
    </dl>
  `
})
export class CodeRegistryInputComponent implements ControlValueAccessor, OnInit {

  @Output() loading = new EventEmitter<boolean>();
  
  control = new FormControl();

  selection: CodeRegistry;
  codeRegistries: CodeRegistry[];

  private propagateChange: (fn: any) => void = () => {};
  private propagateTouched: (fn: any) => void = () => {};

  constructor(@Self() @Optional() public parentControl: NgControl,
              private editableService: EditableService,
              private dataService: DataService) {

    this.control.valueChanges.subscribe(x => this.propagateChange(x));
    
    if (parentControl) {
      parentControl.valueAccessor = this;
    }
  }

  ngOnInit() {

    this.loading.emit(true);
    
    this.dataService.getCodeRegistriesForUser().subscribe(codeRegistries => {
      this.codeRegistries = codeRegistries;
      this.loading.emit(false);
    });
  }

  get show() {
    return this.editing || this.control.value;
  }

  get editing() {
    return this.editableService.editing;
  }

  get options(): CodeRegistry[] {
    return this.codeRegistries;
  }

  isSelected(option: CodeRegistry) {
    return this.selection === option;
  }

  select(option: CodeRegistry) {
    this.selection = option;
    this.propagateChange(option);
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
