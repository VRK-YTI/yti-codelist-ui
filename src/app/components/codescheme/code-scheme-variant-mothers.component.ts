import { Component, Input } from '@angular/core';
import { CodeScheme } from '../../entities/code-scheme';
import {DataService} from '../../services/data.service';
import { ConfigurationService } from '../../services/configuration.service';

@Component({
  selector: 'app-code-scheme-variant-mothers',
  templateUrl: './code-scheme-variant-mothers.component.html',
  styleUrls: ['./code-scheme-variant-mothers.component.scss']
})
export class CodeSchemeVariantMothersComponent {

  @Input() codeScheme: CodeScheme;

  constructor(private dataService: DataService,
              private configurationService: ConfigurationService) {
  }

  getVariantUri(variantUri: string) {
    return this.configurationService.getUriWithEnv(variantUri);
  }
}
