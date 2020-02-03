import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-link',
  template: `
    <dl>
      <dt><label>{{label}}</label></dt>
      <dd><a target="_blank" rel="noopener noreferrer" href="{{value}}">{{value}}</a></dd>
    </dl>
  `
})
export class LinkComponent {

  @Input() label: string;
  @Input() value: string;
}
