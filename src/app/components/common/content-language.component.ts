import { Component, Input, OnChanges, OnInit, SimpleChange, SimpleChanges } from '@angular/core';
import { Language, LanguageService } from '../../services/language.service';
import { CodePlain } from '../../entities/code-simple';

@Component({
  selector: 'app-content-language',
  template: `
      <div ngbDropdown class="d-inline-block float-right" [placement]="placement">
          <button class="btn btn-language" id="content_language_dropdown_button" ngbDropdownToggle *ngIf="contentLanguage === 'all' && !isSomeRegistryPage">
              {{allLangsCode.prefLabel | translateValue:true }}</button>
          <button class="btn btn-language" id="content_language_dropdown_button" ngbDropdownToggle *ngIf="contentLanguage !== 'all'">
              {{contentLanguage }}</button>
          <div ngbDropdownMenu aria-labelledby="content_language_dropdown_button">
              <div *ngIf="actualLanguageCodes && actualLanguageCodes.length > 0">
                  <div *ngIf="!isSomeRegistryPage">
                      <button id="'all_languages_content_lang_dropdown_button'"
                              class="dropdown-item"
                              type="button"
                              [class.active]="translateStringToLanguage(allLangsCode.codeValue) === contentLanguage"
                              (click)='contentLanguage = translateStringToLanguage(allLangsCode.codeValue)'>
                          {{allLangsCode.prefLabel | translateValue:true}}</button>
                  </div>
                  <div *ngFor="let languageCode of actualLanguageCodes">
                      <button id="{{languageCode.codeValue + '_content_lang_dropdown_button'}}"
                              class="dropdown-item"
                              type="button"
                              [class.active]="translateStringToLanguage(languageCode.codeValue) === contentLanguage"
                              (click)='contentLanguage = translateStringToLanguage(languageCode.codeValue)'>
                          {{languageCode.prefLabel | translateValue:true}} - ({{languageCode.codeValue}})</button>
                  </div>
              </div>
              <div *ngIf="!actualLanguageCodes || actualLanguageCodes.length == 0">
                  <div *ngIf="!isSomeRegistryPage">
                      <button id="'all_languages_content_lang_dropdown_button'"
                              class="dropdown-item"
                              type="button"
                              [class.active]="translateStringToLanguage(allLangsCode.codeValue) === contentLanguage"
                              (click)="contentLanguage = translateStringToLanguage(allLangsCode.codeValue)">{{allLangsCode.prefLabel | translateValue:true}}</button>
                  </div>
                  <div *ngFor="let language of languages">
                      <button id="{{language.code + '_content_lang_dropdown_button'}}"
                              class="dropdown-item"
                              type="button"
                              [class.active]="language.code === contentLanguage"
                              (click)='contentLanguage = translateStringToLanguage(language.code)'>{{language.name}}</button>
                  </div>
              </div>
          </div>
      </div>
  `
})
export class ContentLanguageComponent implements OnChanges, OnInit {

  @Input() placement = 'bottom-right';
  @Input() languageCodes: CodePlain[];
  @Input() isSomeRegistryPage = false;
  actualLanguageCodes: CodePlain[];
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

    if (this.languageCodes) {
      const tmp = this.languageCodes;
      tmp.sort((a, b) => {
        if (a.codeValue < b.codeValue) {
          return -1;
        }
        if (a.codeValue > b.codeValue) {
          return 1;
        }
        return 0;
      });
      this.actualLanguageCodes = tmp.slice(); // we need a separate variable for the template to behave correctly, cannot just use the @Input languageCodes
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

    if (this.isSomeRegistryPage && this.contentLanguage === 'all') {
      this.contentLanguage = this.languageService.language;
      if (this.languageCodes) {
        this.actualLanguageCodes = this.languageCodes.filter(code => code.codeValue !== this.allLangsCode.codeValue).slice();
      }
    }

    if (this.languageCodes) {
      const tmp = this.languageCodes;
      tmp.sort((a, b) => {
        if (a.codeValue < b.codeValue) {
          return -1;
        }
        if (a.codeValue > b.codeValue) {
          return 1;
        }
        return 0;
      });
      this.actualLanguageCodes = tmp.slice(); // we need a separate variable for the template to behave correctly, cannot just use the @Input languageCodes
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
      this.languageCodes.forEach(lang => {
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
