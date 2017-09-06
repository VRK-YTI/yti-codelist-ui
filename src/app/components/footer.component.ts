import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  styleUrls: ['./footer.component.scss'],
  template: `
    <div class="panel-footer">

      <span>{{'Give feedback' | translate}}: <a href="mailto:iow@postit.csc.fi" translate>CSC - IT Center for Science Ltd</a></span>

      <span class="float-right">
        <a href="https://github.com/VRK-YTI/rhp" target="_blank">{{'Source code' | translate}}:</a>
        <span translate>licensed under the</span>
        <a href="https://github.com/VRK-YTI/rhp/blob/master/LICENSE.txt" target="_blank">European Union Public Licence</a>
      </span>
    </div>
  `
})
export class FooterComponent {

}
