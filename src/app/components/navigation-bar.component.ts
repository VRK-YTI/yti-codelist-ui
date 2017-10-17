import { Component } from '@angular/core';
import { Language, LanguageService } from '../services/language.service';

@Component({
  selector: 'app-navigation-bar',
  styleUrls: ['./navigation-bar.component.scss'],
  template: `
    <nav class="navbar">
      <svg viewBox="0 0 50 100" id="beta_suomifi_logo" width="80" height="80">
      <g>
        <path fill="#003479" d="M53,0H2C0.9,0,0,0.9,0,2v51c0,1.1,0.9,2,2,2h51c1.1,0,2-0.9,2-2V2C55,0.9,54.1,0,53,0z"></path>
        <g>
          <path fill="#FFFFFF" d="M14,20v-5c0-1.1,0.9-2,2-2h5v7"></path>
          <path fill="#FFFFFF" d="M14,27h7v14c0,0.5-0.4,1-1,1h-5c-0.6,0-1-0.5-1-1"></path>
          <path fill="#FFFFFF" d="M28,13h13c0.5,0,1,0.4,1,1v6H28"></path>
          <path fill="#FFFFFF" d="M41,34H28v-7h14v6C42,33.6,41.6,34,41,34z"></path>
        </g>
      </g>
    </svg>

    <a class="navbar-brand" [routerLink]="['/']">Koodistoeditori</a>
    </nav>
  `
})
export class NavigationBarComponent {

  languages = [
    { code: 'fi' as Language, name: 'Suomeksi' },
    { code: 'en' as Language, name: 'In english' }
  ];

  constructor(private languageService: LanguageService) {
  }

  setLanguage(language: Language) {
    this.languageService.language = language;
  }
}
