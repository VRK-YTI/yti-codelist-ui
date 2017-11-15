import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-literal',
  template: `
    <dl>
      <dt><label>{{label}}</label></dt>
      <dd>{{value}}</dd>
    </dl>
  `
})
export class LiteralComponent {

  @Input() label: string;
  @Input() value: string;
}
