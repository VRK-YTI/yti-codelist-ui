import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CodeScheme } from '../../entities/code-scheme';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-code-scheme-information',
  templateUrl: './code-scheme-information.component.html',
  styleUrls: ['./code-scheme-information.component.scss']
})
export class CodeSchemeInformationComponent implements OnChanges {

  @Input() codeScheme: CodeScheme;

  codeSchemeForm = new FormGroup({
    prefLabels: new FormControl({}),
    descriptions: new FormControl({}),
    definitions: new FormControl({}),
    source: new FormControl(''),
    legalBase: new FormControl(''),
    governancePolicy: new FormControl(''),
    license: new FormControl('')
  });

  ngOnChanges(changes: SimpleChanges): void {
    this.codeSchemeForm.reset(this.codeScheme);
  }
}
