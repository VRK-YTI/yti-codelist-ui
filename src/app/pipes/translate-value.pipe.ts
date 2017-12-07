import { Pipe, PipeTransform, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { LanguageService } from '../services/language.service';
import { Localizable } from 'yti-common-ui/types/localization';

@Pipe({
  name: 'translateValue',
  pure: false
})
export class TranslateValuePipe implements PipeTransform, OnDestroy {

  localization: string;
  languageSubscription?: Subscription;

  constructor(private languageService: LanguageService) {
  }

  transform(value: Localizable, useUILanguage = false): string {

    this.cleanSubscription();
    this.localization = this.languageService.translate(value, useUILanguage);

    const languageObservable = useUILanguage ? this.languageService.language$
                                             : this.languageService.contentLanguage$;

    this.languageSubscription = languageObservable.subscribe(() => {
      this.localization = this.languageService.translate(value, useUILanguage);
    });

    return this.localization;
  }

  cleanSubscription() {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  ngOnDestroy() {
    this.cleanSubscription();
  }
}
