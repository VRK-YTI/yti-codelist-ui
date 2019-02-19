import { Component, Input, Optional, Self } from '@angular/core';
import { EditableService } from '../../services/editable.service';
import { ControlValueAccessor, FormControl, NgControl } from '@angular/forms';
import { Extension } from '../../entities/extension';
import { MemberValue } from '../../entities/member-value';
import { ValueType } from '../../entities/value-type';
import { comparingLocalizable } from 'yti-common-ui/utils/comparator';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-code-extensions-input',
  template: `
    <dt>
      <label>{{label}}</label>
    </dt>
    <div *ngFor="let valueType of valueTypes">
      <app-literal [id]="'code_codeextension_membervalue_' + extension.codeValue + '_' + valueType.localName + '_input'"
                   [label]="valueType.prefLabel | translateValue"
                   [value]="getMemberValueForValueType(valueType.localName)"></app-literal>
    </div>
  `
})
export class CodeExtensionsInputComponent implements ControlValueAccessor {

  @Input() label: string;
  @Input() extension: Extension;
  @Input() memberValues: MemberValue[];
  control = new FormControl(null);

  private propagateChange: (fn: any) => void = () => {};
  private propagateTouched: (fn: any) => void = () => {};

  constructor(@Self() @Optional() public parentControl: NgControl,
              private editableService: EditableService,
              private languageService: LanguageService) {

    this.control.valueChanges.subscribe(x => this.propagateChange(x));

    if (parentControl) {
      parentControl.valueAccessor = this;
    }
  }

  getMemberValueForValueType(type: string): string {
    if (this.memberValues) {
      for (const memberValue of this.memberValues) {
        if (memberValue.valueType.localName === type) {
          return memberValue.value;
        }
      }
    }
    return '';
  }

  get valueTypes(): ValueType[] {
    return this.extension.propertyType.valueTypes.sort(comparingLocalizable<ValueType>(this.languageService, item =>
      item.prefLabel ? item.prefLabel : {}));
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
