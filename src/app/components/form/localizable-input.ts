import { Component, Input, Optional, Self } from '@angular/core';
import { EditableService } from '../../services/editable.service';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { LanguageService } from '../../services/language.service';
import { Localizable } from '@vrk-yti/yti-common-ui';

@Component({
  selector: 'app-localizable-input',
  template: `
    <dl *ngIf="show">
      <dt>
        <label>{{label}}</label>
        <app-information-symbol [infoText]="infoText"></app-information-symbol>
        <app-required-symbol *ngIf="required && editing"></app-required-symbol>
      </dt>
      <dd>
        <div *ngIf="editing" class="form-group">
          <input [id]="id"
                 type="text"
                 class="form-control"
                 [ngClass]="{'is-invalid': !valid}"
                 [ngModel]="value[inputLanguage]"
                 (ngModelChange)="onChange($event)" />
          <app-error-messages [id]="id + '_error_messages'" [control]="parentControl"></app-error-messages>
        </div>
        <div class="text-content-wrap" *ngIf="!editing">{{value | translateValue}}</div>
      </dd>
    </dl>
  `
})
export class LocalizableInputComponent implements ControlValueAccessor {

  @Input() label: string;
  @Input() restrict = false;
  @Input() required = false;
  @Input() id: string;
  @Input() infoText: string;
  @Input() language: string | undefined;
  value: Localizable = {};

  private propagateChange: (fn: any) => void = () => {};
  private propagateTouched: (fn: any) => void = () => {};

  constructor(@Self() @Optional() public parentControl: NgControl,
              private editableService: EditableService,
              private languageService: LanguageService) {

    if (parentControl) {
      parentControl.valueAccessor = this;
    }
  }

  get valid() {
    return !this.parentControl || this.parentControl.valid;
  }

  onChange(value: string) {
    this.value[this.inputLanguage] = value;
    this.propagateChange(this.value);
  }

  get show() {
    return this.editing || this.languageService.translate(this.value);
  }

  get editing() {
    return this.editableService.editing && !this.restrict;
  }

  get inputLanguage() {
    if (this.language) {
      return this.language;
    }
    return this.languageService.contentLanguage;
  }

  writeValue(obj: any): void {
    this.value = Object.assign({}, obj);
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.propagateTouched = fn;
  }
}
