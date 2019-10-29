import { Component, Input, OnChanges, OnInit, SimpleChange, SimpleChanges } from '@angular/core';
import { Language, LanguageService } from '../../services/language.service';
import { CodePlain } from '../../entities/code-simple';

@Component({
  selector: 'app-content-language',
  template: `
      <div ngbDropdown class="d-inline-block float-right" [placement]="placement">
          <button class="btn btn-language" id="content_language_dropdown_button" ngbDropdownToggle *ngIf="contentLanguage === 'all'">
              {{allLangsCode.prefLabel | translateValue:true }}</button>
          <button class="btn btn-language" id="content_language_dropdown_button" ngbDropdownToggle *ngIf="contentLanguage !== 'all'">
              {{contentLanguage }}</button>
          <div ngbDropdownMenu aria-labelledby="content_language_dropdown_button">
              <div *ngIf="languageCodes && languageCodes.length > 0">
                  <div *ngFor="let languageCode of languageCodes">
                      <button id="{{languageCode.codeValue + '_content_lang_dropdown_button'}}"
                              class="dropdown-item"
                              type="button"
                              [class.active]="translateStringToLanguage(languageCode.codeValue) === contentLanguage"
                              (click)='contentLanguage = translateStringToLanguage(languageCode.codeValue)'>
                          {{languageCode.prefLabel | translateValue:true}} - ({{languageCode.codeValue}})</button>
                  </div>
                  <div>
                      <button id="'all_languages_content_lang_dropdown_button'"
                              class="dropdown-item"
                              type="button"
                              [class.active]="translateStringToLanguage(allLangsCode.codeValue) === contentLanguage"
                              (click)='contentLanguage = translateStringToLanguage(allLangsCode.codeValue)'>
                          {{allLangsCode.prefLabel | translateValue:true}}</button>
                  </div>
              </div>
              <div *ngIf="!languageCodes || languageCodes.length == 0">
                  <div *ngFor="let language of languages">
                      <button id="{{language.code + '_content_lang_dropdown_button'}}"
                              class="dropdown-item"
                              type="button"
                              [class.active]="language.code === contentLanguage"
                              (click)='contentLanguage = translateStringToLanguage(language.code)'>{{language.name}}</button>
                  </div>
                  <div>
                      <button id="'all_languages_content_lang_dropdown_button'"
                              class="dropdown-item"
                              type="button"
                              [class.active]="translateStringToLanguage(allLangsCode.codeValue) === contentLanguage"
                              (click)="contentLanguage = translateStringToLanguage(allLangsCode.codeValue)">{{allLangsCode.prefLabel | translateValue:true}}</button>
                  </div>
              </div>
          </div>
      </div>
  `
})
export class ContentLanguageComponent implements OnChanges, OnInit {

  @Input() placement = 'bottom-right';
  @Input() languageCodes: CodePlain[];
  allLangsCodeInitiated = false;

  languages = [
    { code: 'fi' as Language, name: 'Suomeksi (FI)' },
    { code: 'sv' as Language, name: 'På svenska (SV)' },
    { code: 'en' as Language, name: 'In English (EN)' },
  ];

  allLangsCode: CodePlain;

  ngOnInit() {

    if (!this.contentLanguage) {
      this.contentLanguage = 'all' as Language;
    }
  }

  translateStringToLanguage(codeValue: string): Language {
    return codeValue as Language;
  }

  constructor(public languageService: LanguageService) {
  }

  get hasCustomLanguages(): boolean {
    return this.languageCodes && this.languageCodes.length > 0;
  }

  ngOnChanges(changes: SimpleChanges) {

    const contentLang: SimpleChange = changes.languageCodes;

    if (!this.allLangsCodeInitiated) {
      this.allLangsCode = new CodePlain({
        id: '',
        uri: '',
        url: '',
        codeValue: 'all',
        prefLabel: { fi: 'Sisältö kaikilla kielillä', en: 'Content in all languages' },
        status: 'VALID',
        hierarchyLevel: 1,
      });
      this.allLangsCodeInitiated = true;
    }

    if (this.hasCustomLanguages) {
      const currentLanguage = this.languageService.contentLanguage;
      if (!this.findLanguage(currentLanguage)) {
        this.refreshLanguages();
      }
    }
  }

  findLanguage(language: Language): CodePlain | undefined {
    const defaultLanguageCodes: CodePlain[] = this.languageCodes.filter(languageCode =>
      codeValueMatches(language, languageCode)
    );

    if (defaultLanguageCodes && defaultLanguageCodes.length > 0) {
      return defaultLanguageCodes[0];
    } else {
      return undefined;
    }

    function codeValueMatches(languageCode: string, code: CodePlain) {
      return code.codeValue === languageCode;
    }
  }

  refreshLanguages() {
    if (this.hasCustomLanguages) {
      let thePreviousContentLanguageIsAlsoAmongTheNextContentLanguages = false;
      this.languageCodes.forEach( lang => {
        if (lang.codeValue === this.contentLanguage) {
          thePreviousContentLanguageIsAlsoAmongTheNextContentLanguages = true;
        }
      });
      if (!thePreviousContentLanguageIsAlsoAmongTheNextContentLanguages) { // if language was "swahili" but the next opened codescheme is "fi, sv, en" we choose "all languages"
        this.contentLanguage = 'all';
      }
    }
  }

  get contentLanguage(): Language {
    return this.languageService.contentLanguage;
  }

  set contentLanguage(value: Language) {
    this.languageService.contentLanguage = value;
  }
}
