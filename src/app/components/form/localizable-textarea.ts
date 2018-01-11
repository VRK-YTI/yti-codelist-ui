import { Component, Input, Optional, Self } from '@angular/core';
import { Localizable } from 'yti-common-ui/types/localization';
import { EditableService } from '../../services/editable.service';
import { LanguageService } from '../../services/language.service';
import { ControlValueAccessor, NgControl } from '@angular/forms';

@Component({
  selector: 'app-localizable-textarea',
  template: `
    <dl *ngIf="show">
      <dt><label>{{label}}</label></dt>
      <dd>
        <div *ngIf="editing" class="form-group">
          <textarea rows="3" 
                    class="form-control"
                    [ngClass]="{'is-invalid': !valid}"
                    [ngModel]="value[contentLanguage]" 
                    (ngModelChange)="onChange($event)"></textarea>
          <app-error-messages [control]="parentControl"></app-error-messages>
        </div>
        <span class="text-content-wrap" *ngIf="!editing">{{value | translateValue}}</span>
      </dd>
    </dl>
  `
})
export class LocalizableTextareaComponent implements ControlValueAccessor {

  @Input() label: string;
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
    return this.editableService.editing;
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
