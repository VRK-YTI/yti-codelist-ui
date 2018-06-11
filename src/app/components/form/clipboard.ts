import { Component, Input, OnInit } from '@angular/core';

const clippyImage = require('../../../assets/clippy.svg');

@Component({
  selector: 'app-clipboard',
  template: `
    <dl>
      <dt><label>{{label}}</label></dt>
      <dd>
        <a *ngIf="showAsLink" target="_blank" href="{{value}}">{{value}}</a>
        <span *ngIf="!showAsLink">{{value}}</span>
        <button class="btn" type="button" ngxClipboard [cbContent]="value">
          <img [src]="this.clippyImage"
               class="svg-icon"
               title="{{'Copy value to clipboard' | translate:translateParams}}">
        </button>
      </dd>
    </dl>
  `
})
export class ClipboardComponent {

  @Input() label: string;
  @Input() value: string;
  @Input() showAsLink = false;

  clippyImage = clippyImage;

  get translateParams() {
    return {
      value: this.value
    };
  }
}
