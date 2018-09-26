import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CodeRegistry } from '../../entities/code-registry';
import { DataService } from '../../services/data.service';
import { CodeScheme } from '../../entities/code-scheme';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-code-registry-code-schemes',
  templateUrl: './registry-code-schemes.component.html',
  styleUrls: ['./registry-code-schemes.component.scss']
})
export class RegistryCodeSchemesComponent {

  @Input() codeRegistry: CodeRegistry;
  @Input() codeSchemes: CodeScheme[];

  constructor(private dataService: DataService,
              private router: Router,
              public languageService: LanguageService) {
    console.log('RegistryCodeSchemesComponent constructor');
  }

  viewCodeScheme(codeScheme: CodeScheme) {
    console.log('Viewing codescheme: ' + codeScheme.codeValue + ' from registry: ' + codeScheme.codeRegistry.codeValue);
    this.router.navigate(codeScheme.route);
  }
}
