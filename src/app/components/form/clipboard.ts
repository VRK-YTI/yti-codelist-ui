import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-clipboard',
  template: `
    <dl>
      <dt><label>{{label}}</label></dt>
      <dd>
        {{value}}
        <button class="btn" type="button" ngxClipboard [cbContent]="value">
          <img src="../../../assets/clippy.svg" class="svg-icon" alt="Copy to clipboard">
        </button>
      </dd>
    </dl>
  `
})
export class ClipboardComponent {

  @Input() label: string;
  @Input() value: string;
}
