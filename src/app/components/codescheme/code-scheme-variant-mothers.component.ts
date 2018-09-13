import { Component, Input } from '@angular/core';
import { CodeScheme } from '../../entities/code-scheme';

@Component({
  selector: 'app-code-scheme-variant-mothers',
  templateUrl: './code-scheme-variant-mothers.component.html',
  styleUrls: ['./code-scheme-variant-mothers.component.scss']
})
export class CodeSchemeVariantMothersComponent {

  @Input() codeScheme: CodeScheme;
}
