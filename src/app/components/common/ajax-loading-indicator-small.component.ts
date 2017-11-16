import { Component } from '@angular/core';

const image = require('../../../assets/ajax-loading-indicator-small.gif');

@Component({
  selector: 'app-ajax-loading-indicator-small',
  template: `<img [src]="src" />`
})
export class AjaxLoadingIndicatorSmallComponent {
  src = image;
}
