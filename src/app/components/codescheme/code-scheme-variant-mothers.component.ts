import { Component, Input } from '@angular/core';
import { CodeScheme } from '../../entities/code-scheme';
import {DataService} from '../../services/data.service';
import { ConfigurationService } from '../../services/configuration.service';
import { CodeSchemeListItem } from '../../entities/code-scheme-list-item';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-code-scheme-variant-mothers',
  templateUrl: './code-scheme-variant-mothers.component.html',
  styleUrls: ['./code-scheme-variant-mothers.component.scss']
})
export class CodeSchemeVariantMothersComponent {

  @Input() codeScheme: CodeScheme;

  constructor(private languageService: LanguageService,
              private dataService: DataService,
              private configurationService: ConfigurationService) {
  }

  getVariantUri(variantUri: string): string | null {
    return this.configurationService.getUriWithEnv(variantUri);
  }

  getVariantDisplayName(variant: CodeSchemeListItem): string {
    return variant.getDisplayName(this.languageService, false);
  }
}
