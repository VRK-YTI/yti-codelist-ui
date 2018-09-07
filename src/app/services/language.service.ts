import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Language, Localizable, Localizer } from 'yti-common-ui/types/localization';
import { BehaviorSubject, Observable } from 'rxjs';

export { Language };

@Injectable()
export class LanguageService implements Localizer {

  language$ = new BehaviorSubject<Language>('fi');
  contentLanguage$ = new BehaviorSubject<Language>('fi');

  constructor(private translateService: TranslateService) {

    translateService.addLangs(['fi', 'en']);
    translateService.use('fi');
    translateService.setDefaultLang('en');
    this.language$.subscribe(lang => this.translateService.use(lang));

    this.language$.subscribe(language => {
      this.contentLanguage = language;
    });
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

  get translateLanguage$(): Observable<Language> {
    return this.contentLanguage$;
  }

  translate(localizable: Localizable, useUILanguage = false): string {

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
