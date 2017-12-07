import { Component } from '@angular/core';
import { LocationService } from '../services/location.service';

@Component({
  selector: 'app-root',
  styleUrls: ['./app.component.scss'],
  template: `
    <ng-template ngbModalContainer></ng-template>
    <app-navigation-bar></app-navigation-bar>
    <div class="container-fluid">
      <app-breadcrumb [location]="location"></app-breadcrumb>
      <router-outlet></router-outlet>
    </div>
    <app-footer [title]="'Code List Service' | translate"></app-footer>
  `
})
export class AppComponent {

  constructor(private locationService: LocationService) {
  }

  get location() {
    return this.locationService.location;
  }
}
