import { Component, Input } from '@angular/core';
import { Language, LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-content-language',
  template: `
    <div ngbDropdown class="d-inline-block float-right" [placement]="placement">
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
export class ContentLanguageComponent {

  @Input() placement = 'bottom-right';

  languages = [
    { code: 'fi' as Language, name: 'Suomeksi (FI)' },
    { code: 'sv' as Language, name: 'På svenska (SV)' },
    { code: 'en' as Language, name: 'In English (EN)' }
  ];

  constructor(public languageService: LanguageService) {
  }

  get contentLanguage() {
    return this.languageService.contentLanguage;
  }

  set contentLanguage(value: Language) {
    this.languageService.contentLanguage = value;
  }
}
