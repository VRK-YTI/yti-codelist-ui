import { Component, Input } from '@angular/core';
import { Localizable } from '../../entities/localization';
import { EditableService } from '../../services/editable.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-localizable-input',
  template: `
    <dl *ngIf="show">
      <dt><label>{{label}}</label></dt>
      <dd>
        <div *ngIf="editing" class="form-group">
          <input type="text" class="form-control" [(ngModel)]="value[contentLanguage]" />
        </div>
        <span *ngIf="!editing">{{value | translateValue}}</span>
      </dd>
    </dl>
  `
})
export class LocalizableInputComponent {

  @Input() label: string;
  @Input() value: Localizable;

  constructor(private editableService: EditableService,
              private languageService: LanguageService) {
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
}
