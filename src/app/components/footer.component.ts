import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  styleUrls: ['./footer.component.scss'],
  template: `
    <div class="panel-footer">

      <span>{{'Give feedback' | translate}}: <a href="mailto:yhteentoimivuus@vrk.fi" translate>Population Registry Center of Finland</a></span>

      <span class="float-right">
        <a href="https://github.com/VRK-YTI/yti-codelist-ui" target="_blank">{{'Source code' | translate}}:</a>
        <span translate>licensed under the</span>
        <a href="https://github.com/VRK-YTI/yti-codelist-ui/blob/master/LICENSE" target="_blank">European Union Public Licence</a>
      </span>
    </div>
  `
})
export class FooterComponent {

}
