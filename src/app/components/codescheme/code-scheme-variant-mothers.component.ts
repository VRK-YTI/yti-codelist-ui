import { Component, Input } from '@angular/core';
import { CodeScheme } from '../../entities/code-scheme';
import {DataService} from '../../services/data.service';

@Component({
  selector: 'app-code-scheme-variant-mothers',
  templateUrl: './code-scheme-variant-mothers.component.html',
  styleUrls: ['./code-scheme-variant-mothers.component.scss']
})
export class CodeSchemeVariantMothersComponent {

  @Input() codeScheme: CodeScheme;

  env: string;

  constructor(private dataService: DataService) {
    dataService.getServiceConfiguration().subscribe(configuration => {
      this.env = configuration.env;
    });
  }

  getVariantUri(variantUri: string) {
    if (this.env !== 'prod') {
      return variantUri + '?env=' + this.env;
    }
    return variantUri;
  }
}
