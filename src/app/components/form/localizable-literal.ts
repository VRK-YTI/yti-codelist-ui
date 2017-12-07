import { Component, Input } from '@angular/core';
import { Localizable } from 'yti-common-ui/types/localization';

@Component({
  selector: 'app-localizable-literal',
  template: `
    <dl>
      <dt><label>{{label}}</label></dt>
      <dd>{{value | translateValue}}</dd>
    </dl>
  `
})
export class LocalizableLiteralComponent {

  @Input() label: string;
  @Input() value: Localizable;
}
