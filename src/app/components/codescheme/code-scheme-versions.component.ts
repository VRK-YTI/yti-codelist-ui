import {Component, Input} from '@angular/core';
import {CodeScheme} from '../../entities/code-scheme';

@Component({
  selector: 'app-code-scheme-versions',
  templateUrl: './code-scheme-versions.component.html',
  styleUrls: ['./code-scheme-versions.component.scss']
})
export class CodeSchemeVersionsComponent {

  @Input() codeScheme: CodeScheme;
}
