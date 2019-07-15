import { Component, Input, Optional, Self } from '@angular/core';
import { EditableService } from '../../services/editable.service';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { LanguageService } from '../../services/language.service';
import { Localizable } from 'yti-common-ui/types/localization';

@Component({
  selector: 'app-localizable-input-with-language-indicator',
  template: `
    <dl *ngIf="show">
      <dt>
        <label>{{label}}</label>
        <app-information-symbol [infoText]="infoText"></app-information-symbol>
        <app-required-symbol *ngIf="required && editing"></app-required-symbol>
      </dt>
      <dd>
        <div *ngIf="editing" class="form-group">
          <div class="language">
            <span>{{contentLanguage | uppercase}}</span>
          </div>
          <div class="languageContent">
            <input [id]="id"
                   type="text"
                   class="form-control"
                   [ngClass]="{'is-invalid': !valid}"
                   [ngModel]="value[contentLanguage]"
                   (ngModelChange)="onChange($event)"/>
          </div>
          <app-error-messages [id]="id + '_error_messages'" [control]="parentControl"></app-error-messages>
        </div>
        <div class="text-content-wrap" *ngIf="!editing">
          <div class="language">
            <span>{{contentLanguage | uppercase}}</span>
          </div>
          <div class="languageContent">
            <span>{{value | translateValue}}</span>
          </div>
        </div>
      </dd>
    </dl>
  `
})
export class LocalizableInputWithLangauageIndicatorComponent implements ControlValueAccessor {

  @Input() label: string;
  @Input() restrict = false;
  @Input() required = false;
  @Input() id: string;
  @Input() infoText: string;
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
    this.value[this.contentLanguage] = value;
    this.propagateChange(this.value);
  }

  get show() {
    return this.editing || this.languageService.translate(this.value);
  }

  get editing() {
    return this.editableService.editing && !this.restrict;
  }

  get contentLanguage() {
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
