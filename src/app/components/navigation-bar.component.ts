import { Component } from '@angular/core';
import { Language, LanguageService } from '../services/language.service';

@Component({
  selector: 'app-navigation-bar',
  styleUrls: ['./navigation-bar.component.scss'],
  templateUrl: './navigation-bar.component.html',
})
export class NavigationBarComponent {

  selectedLanguage: string;

  languages = [
    { code: 'fi' as Language, name: 'Suomeksi (FI)' },
    { code: 'sv' as Language, name: 'På svenska (SV)' },
    { code: 'en' as Language, name: 'In English (EN)' }
  ];

  constructor(private languageService: LanguageService) {
    this.selectedLanguage = 'FI';
  }

  setLanguage(language: Language) {
    this.selectedLanguage = language.toUpperCase();
    this.languageService.language = language;
  }
}
