import { Component } from '@angular/core';
import { Language, LanguageService } from '../services/language.service';

@Component({
  selector: 'app-navigation-bar',
  styleUrls: ['./navigation-bar.component.scss'],
  templateUrl: './navigation-bar.component.html',
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
