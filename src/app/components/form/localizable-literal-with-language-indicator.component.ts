import { Component, Input, Optional, Self } from '@angular/core';
import { Localizable } from 'yti-common-ui/types/localization';
import { NgControl } from '@angular/forms';
import { EditableService } from '../../services/editable.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-localizable-literal-with-language-indicator',
  template: `
    <dl>
      <dt>
        <label>{{label}}</label>
        <app-information-symbol [infoText]="infoText"></app-information-symbol>
      </dt>
      <div class="language" style="margin-right: 10px">{{contentLanguage | uppercase}}</div>
      <dd>{{value | translateValue}}</dd>
    </dl>
  `
})
export class LocalizableLiteralWithLanguageIndicatorComponent {

  constructor(private languageService: LanguageService) {

  }

  @Input() label: string;
  @Input() value: Localizable;
  @Input() infoText: string;

  get contentLanguage() {
    return this.languageService.contentLanguage;
  }
}
