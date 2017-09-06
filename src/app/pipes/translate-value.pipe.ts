import { Pipe, PipeTransform, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { LanguageService } from '../services/language.service';
import { Localizable } from '../entities/localization';

@Pipe({
  name: 'translateValue',
  pure: false
})
export class TranslateValuePipe implements PipeTransform, OnDestroy {

  localization?: string;
  changeSubscription?: Subscription;

  constructor(private languageService: LanguageService) {
  }

  transform(value: Localizable): string {

    this.localization = this.languageService.translate(value);

    this.languageService.languageChange$.subscribe(() => {
      this.localization = this.languageService.translate(value);
    });

    return this.localization;
  }

  ngOnDestroy() {
    if (this.changeSubscription) {
      this.changeSubscription.unsubscribe();
    }
  }
}
