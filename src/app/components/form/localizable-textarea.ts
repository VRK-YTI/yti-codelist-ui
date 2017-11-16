import { Component, forwardRef, Input } from '@angular/core';
import { Localizable } from '../../entities/localization';
import { EditableService } from '../../services/editable.service';
import { LanguageService } from '../../services/language.service';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-localizable-textarea',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => LocalizableTextareaComponent),
    multi: true
  }],
  template: `
    <dl *ngIf="show">
      <dt><label [for]="name">{{label}}</label></dt>
      <dd>
        <div *ngIf="editing" class="form-group">
          <textarea [id]="name" 
                    rows="3" 
                    class="form-control" 
                    [ngModel]="value[contentLanguage]" 
                    (ngModelChange)="onChange($event)"></textarea>
        </div>
        <span *ngIf="!editing">{{value | translateValue}}</span>
      </dd>
    </dl>
  `
})
export class LocalizableTextareaComponent implements ControlValueAccessor {

  @Input() label: string;
  @Input() name: string;
  value: Localizable = {};

  private propagateChange: (fn: any) => void = () => {};
  private propagateTouched: (fn: any) => void = () => {};

  constructor(private editableService: EditableService,
              private languageService: LanguageService) {
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
    this.value = obj;
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.propagateTouched = fn;
  }
}
