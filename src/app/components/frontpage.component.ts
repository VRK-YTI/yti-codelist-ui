import { Component } from '@angular/core';
import { LocationService } from '../services/location.service';

@Component({
  selector: 'app-frontpage',
  styleUrls: ['./frontpage.component.scss'],
  template: `
    <div class="container-fluid">
      <div class="row">
        <div class="col-md-12">
          <h2 translate>Hello world!</h2>
        </div>
      </div>
    </div>
  `
})
export class FrontpageComponent {

  constructor(locationService: LocationService) {
    locationService.atFrontPage();
  }
}
