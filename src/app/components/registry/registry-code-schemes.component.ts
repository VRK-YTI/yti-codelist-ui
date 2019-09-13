import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CodeRegistry } from '../../entities/code-registry';
import { DataService } from '../../services/data.service';
import { CodeScheme } from '../../entities/code-scheme';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-code-registry-code-schemes',
  templateUrl: './registry-code-schemes.component.html',
  styleUrls: ['./registry-code-schemes.component.scss']
})
export class RegistryCodeSchemesComponent implements OnInit {

  @Input() codeRegistry: CodeRegistry;
  @Input() codeSchemes: CodeScheme[];

  loading: boolean;

  constructor(private dataService: DataService,
              private route: ActivatedRoute,
              private router: Router,
              public languageService: LanguageService) {
  }

  ngOnInit() {

    if (!this.codeSchemes || this.codeSchemes.length === 0) {
      const registryCodeValue = this.route.snapshot.params.registryCode;
      this.dataService.getCodeSchemesForCodeRegistry(registryCodeValue).subscribe(codeSchemes => {
        this.codeSchemes = codeSchemes;
        this.loading = false;
      });
    }
  }

  viewCodeScheme(codeScheme: CodeScheme) {

    this.router.navigate(codeScheme.route);
  }
}
