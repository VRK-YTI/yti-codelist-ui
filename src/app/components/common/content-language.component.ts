import { Component, Input, OnInit } from '@angular/core';
import { Language, LanguageService } from '../../services/language.service';
import { CodePlain } from '../../entities/code-simple';

@Component({
  selector: 'app-content-language',
  template: `
    <div ngbDropdown class="d-inline-block float-right" [placement]="placement">
      <button class="btn btn-language" id="content_language_dropdown_button" ngbDropdownToggle>{{contentLanguage}}</button>
      <div ngbDropdownMenu aria-labelledby="content_language_dropdown_button">
        <div *ngIf="languageCodes && languageCodes.length > 0">
          <div *ngFor="let languageCode of languageCodes">
            <button id="{{languageCode.codeValue + '_content_lang_dropdown_button'}}"
                    class="dropdown-item"
                    type="button"
                    [class.active]="this.translateStringToLanguage(languageCode.codeValue) === contentLanguage"
                    (click)='contentLanguage = this.translateStringToLanguage(languageCode.codeValue)'>{{languageCode.prefLabel | translateValue:true}} - ({{languageCode.codeValue}})</button>
          </div>
        </div>
        <div *ngIf="!languageCodes || languageCodes.length == 0">
          <div *ngFor="let language of languages">
            <button id="{{language.code + '_content_lang_dropdown_button'}}"
                    class="dropdown-item"
                    type="button"
                    [class.active]="language.code === contentLanguage"
                    (click)='contentLanguage = language.code'>{{language.name}}</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ContentLanguageComponent implements OnInit {

  @Input() placement = 'bottom-right';
  @Input() languageCodes: CodePlain[];

  languages = [
    { code: 'fi' as Language, name: 'Suomeksi (FI)' },
    { code: 'sv' as Language, name: 'På svenska (SV)' },
    { code: 'en' as Language, name: 'In English (EN)' }
  ];

  translateStringToLanguage(codeValue: string): Language {
    return codeValue as Language;
  }

  constructor(public languageService: LanguageService) {
  }

  ngOnInit() {
    if (this.languageCodes && this.languageCodes.length > 0) {
      const language: Language = this.languageCodes[0].codeValue as Language;
      this.contentLanguage = language;
    }
  }

  get contentLanguage(): Language {
    return this.languageService.contentLanguage;
  }

  set contentLanguage(value: Language) {
    console.log('Setting content language to: ' + value);
    this.languageService.contentLanguage = value;
  }
}
