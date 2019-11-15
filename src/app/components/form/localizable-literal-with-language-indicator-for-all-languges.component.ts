import { Component, Input, OnInit, Optional, Self } from '@angular/core';
import { Localizable } from 'yti-common-ui/types/localization';
import { NgControl } from '@angular/forms';
import { EditableService } from '../../services/editable.service';
import { LanguageService } from '../../services/language.service';
import { CodePlain } from '../../entities/code-simple';

@Component({
  selector: 'app-localizable-literal-with-language-indicator-for-all-languages',
  template: `
    <dl *ngIf="contentLanguage !== 'all'">
      <dt>
        <label>{{label}}</label>
        <app-information-symbol [infoText]="infoText"></app-information-symbol>
      </dt>
      <div class="text-content-wrap">
        <div class="language">
          <span>{{contentLanguage | uppercase}}</span>
        </div>
        <div class="languageContent">
          <span>{{value | translateValue}}</span>
        </div>
      </div>
    </dl>
    <dl *ngIf="contentLanguage === 'all'">
      <dt>
        <label>{{label}}</label>
        <app-information-symbol [infoText]="infoText"></app-information-symbol>
      </dt>
      <div *ngFor="let lang of realLanguageCodes" class="text-content-wrap">
        <div class="language" style="float: none; margin-bottom: 2px" *ngIf="!!value[lang.codeValue] && value[lang.codeValue].length > 0">
          <span>{{lang.codeValue | uppercase}}</span>
        </div>
        <div class="languageContent" *ngIf="!!value[lang.codeValue] && value[lang.codeValue].length > 0">
          <span>{{value[lang.codeValue]}}</span>
        </div>
      </div>
    </dl>
  `
})
export class LocalizableLiteralWithLanguageIndicatorForAllLanguagesComponent implements OnInit {

  constructor(private languageService: LanguageService) {

  }

  @Input() label: string;
  @Input() value: Localizable;
  @Input() infoText: string;
  @Input() parentElementsLanguageCodes: CodePlain[] = [];
  realLanguageCodes: CodePlain[] = [];

  get contentLanguage() {
    return this.languageService.contentLanguage;
  }

  ngOnInit() {
    if (this.realLanguageCodes && this.realLanguageCodes.length === 0 && this.parentElementsLanguageCodes) {
      this.parentElementsLanguageCodes.forEach(lang => {
        if (lang.codeValue !== 'all') {
          this.realLanguageCodes.push(lang);
        }
      });
      const tmp: CodePlain[] = this.realLanguageCodes.slice();
      tmp.sort((a, b) => {
        if (a.codeValue < b.codeValue) {
          return -1;
        }
        if (a.codeValue > b.codeValue) {
          return 1;
        }
        return 0;
      });
      this.realLanguageCodes = tmp;
    }
  }
}
