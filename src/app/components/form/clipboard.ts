import { Component, Input, OnInit } from '@angular/core';

const clippyImage = require('../../../assets/clippy.svg');

@Component({
  selector: 'app-clipboard',
  template: `
    <dl>
      <dt><label>{{label}}</label></dt>
      <dd>
        {{value}}
        <button class="btn" type="button" ngxClipboard [cbContent]="value">
          <img [src]="this.clippyImage"
               class="svg-icon"
               title="{{'Copy value to clipboard' | translate:translateParams}}">
        </button>
      </dd>
    </dl>
  `
})
export class ClipboardComponent implements OnInit {

  @Input() label: string;
  @Input() value: string;

  translateParams?: {};
  clippyImage = clippyImage;

  ngOnInit() {

    this.translateParams = {
      value: this.value
    };
  }
}
