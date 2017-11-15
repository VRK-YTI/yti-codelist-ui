import { Injectable } from '@angular/core';
import { TranslateService } from 'ng2-translate';
import { Localizable } from '../entities/localization';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

export type Language = string;

export interface Localizer {
  translate(localizable: Localizable): string;
}

@Injectable()
export class LanguageService implements Localizer {

  language$ = new BehaviorSubject<Language>('fi');
  contentLanguage$ = new BehaviorSubject<Language>('fi');

  constructor(private translateService: TranslateService) {

    translateService.addLangs(['fi', 'en']);
    translateService.use('fi');
    translateService.setDefaultLang('en');
    this.language$.subscribe(lang => this.translateService.use(lang));
  }

  get language(): Language {
    return this.language$.getValue();
  }

  set language(language: Language) {
    if (this.language !== language) {
      this.language$.next(language);
    }
  }

  get contentLanguage(): Language {
    return this.contentLanguage$.getValue();
  }

  set contentLanguage(language: Language) {
    if (this.contentLanguage !== language) {
      this.contentLanguage$.next(language);
    }
  }

  translate(localizable: Localizable, useUILanguage = false) {

    if (!localizable) {
      return '';
    }

    const primaryLocalization = localizable[useUILanguage ? this.language : this.contentLanguage];

    if (primaryLocalization) {
      return primaryLocalization;
    } else {

      // FIXME: dummy fallback
      for (const [language, value] of Object.entries(localizable)) {
        if (value) {
          return `${value} (${language})`;
        }
      }

      return '';
    }
  }
}
