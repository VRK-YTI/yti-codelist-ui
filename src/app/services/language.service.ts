import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { TranslateService } from 'ng2-translate';
import { Localizable } from '../entities/localization';

export type Language = string;

export interface Localizer {
  translate(localizable: Localizable): string;
}

@Injectable()
export class LanguageService implements Localizer {

  private _language: Language;
  languageChange$ = new Subject<Language>();

  constructor(private translateService: TranslateService) {
    this._language = 'fi';
    translateService.addLangs(['fi', 'sv', 'en']);
    translateService.use('fi');
    translateService.setDefaultLang('en');
  }

  get language(): Language {
    return this._language;
  }

  set language(language: Language) {
    this._language = language;
    this.translateService.use(language);
    this.languageChange$.next(language);
  }

  translate(localizable: Localizable) {

    if (!localizable) {
      return '';
    }

    const primaryLocalization = localizable[this.language];

    if (primaryLocalization) {
      return primaryLocalization;
    } else {

      for (const [language, value] of Object.entries(localizable)) {
        if (value) {
          return `${value} (${language})`;
        }
      }

      return '';
    }
  }
}
