import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgbPopover, NgbTooltip } from '@ng-bootstrap/ng-bootstrap';

const clippyImage = require('../../../assets/clippy.svg');

@Component({
  selector: 'app-clipboard',
  template: `
    <dl>
      <dt>
        <label>{{label}}</label>
        <app-information-symbol [infoText]="infoText"></app-information-symbol>
      </dt>
      <dd>
        <a *ngIf="showAsLink" target="_blank" href="{{value}}">{{value}}</a>
        <span *ngIf="!showAsLink">{{value}}</span>
        <img [src]="this.clippyImage"
             class="svg-icon"
             #t="ngbTooltip"
             ngbTooltip="{{'Copy value to clipboard' | translate:translateParams}}"
             #p="ngbPopover"
             ngbPopover="{{'Copied to clipboard' | translate}}"
             ngxClipboard [cbContent]="value"
             (click)="clickToolTip()">
      </dd>
    </dl>
  `
})
export class ClipboardComponent {

  @ViewChild('t') public tooltip: NgbTooltip;
  @ViewChild('p') public popover: NgbPopover;

  @Input() label: string;
  @Input() value: string;
  @Input() showAsLink = false;
  @Input() infoText: string;

  clippyImage = clippyImage;

  get translateParams() {
    return {
      value: this.value
    };
  }

  clickToolTip() {
    this.tooltip.close();
    setTimeout(() => {
      this.popover.close();
    }, 1500);
  }
}
