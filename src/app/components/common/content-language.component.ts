import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Language, LanguageService } from '../../services/language.service';
import { Subscription } from 'rxjs';
import { contains } from 'yti-common-ui/utils/array';

@Component({
  selector: 'app-content-language',
  template: `
    <div ngbDropdown class="d-inline-block pull-right" [placement]="placement">
      <button class="btn btn-language" id="content_language_dropdown_button" ngbDropdownToggle>{{contentLanguage.toUpperCase()}}</button>
      <div ngbDropdownMenu aria-labelledby="content_language_dropdown_button">
        <div *ngFor="let language of languages">
          <button id="{{language.code + '_content_lang_dropdown_button'}}"
                  class="dropdown-item"
                  type="button"
                  [class.active]="language.code === contentLanguage"
                  (click)='contentLanguage = language.code'>{{language.name}}</button>
        </div>
      </div>
    </div>
  `
})
export class ContentLanguageComponent implements OnInit, OnDestroy {

  @Input() placement = 'bottom-right';

  languages = [
    { code: 'fi' as Language, name: 'Suomeksi (FI)' },
    { code: 'sv' as Language, name: 'På svenska (SV)' },
    { code: 'en' as Language, name: 'In English (EN)' }
  ];

  private subscriptionToClean: Subscription[] = [];

  constructor(public languageService: LanguageService) {
  }

  ngOnInit() {

    this.subscriptionToClean.push(this.languageService.language$
      .subscribe(language => {
        const languageExistsInContentLanguages = contains(this.languages.map(lang => lang.code), language);

        if (languageExistsInContentLanguages) {
          this.contentLanguage = language;
        }
      }));
  }

  get contentLanguage() {
    return this.languageService.contentLanguage;
  }

  set contentLanguage(value: Language) {
    this.languageService.contentLanguage = value;
  }

  ngOnDestroy(): void {
    this.subscriptionToClean.forEach(s => s.unsubscribe());
  }
}
