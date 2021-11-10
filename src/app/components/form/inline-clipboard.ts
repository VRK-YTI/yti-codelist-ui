import { Component, Input, ViewChild } from '@angular/core';
import { NgbPopover, NgbTooltip } from '@ng-bootstrap/ng-bootstrap';

const clippyImage = '../../../assets/clippy.svg';

@Component({
  selector: 'app-inline-clipboard',
  styleUrls: ['./inline-clipboard.scss'],
  template: `
    <dl>
      <dt>
        <label>{{label}}</label>
        <app-information-symbol [infoText]="infoText"></app-information-symbol>
      </dt>
      <dd>
        <a *ngIf="showAsLink" class="text-content-wrap" target="_blank" rel="noopener noreferrer" href="{{value}}">{{value}}</a>
        <span *ngIf="!showAsLink" class="text-content-wrap">{{value}}</span>
        <img [src]="this.clippyImage"
             class="svg-icon clipboard"
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
export class InlineClipboardComponent {

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
