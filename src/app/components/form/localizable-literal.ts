import { Component, Input } from '@angular/core';
import { Localizable } from 'yti-common-ui/types/localization';

@Component({
  selector: 'app-localizable-literal',
  template: `
    <dl>
      <dt>
        <label>{{label}}</label>
        <app-information-symbol [infoText]="infoText"></app-information-symbol>
      </dt>
      <dd>{{value | translateValue}}</dd>
    </dl>
  `
})
export class LocalizableLiteralComponent {

  @Input() label: string;
  @Input() value: Localizable;
  @Input() infoText: string;
}
