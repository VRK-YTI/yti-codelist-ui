import { Component } from '@angular/core';
import { LocationService } from '../services/location.service';
import { Router } from '@angular/router';
import { ConfigurationService } from '../services/configuration.service';

@Component({
  selector: 'app-root',
  styleUrls: ['./app.component.scss'],
  template: `
    <div *ngIf="loading">
      <app-ajax-loading-indicator></app-ajax-loading-indicator>
    </div>
    <div *ngIf="!loading">
      <ng-template ngbModalContainer></ng-template>
      <app-navigation-bar></app-navigation-bar>
      <div class="container-fluid">
        <app-breadcrumb [location]="location" [linkActive]="true" [refreshPath]="['re']"></app-breadcrumb>
        <router-outlet></router-outlet>
      </div>
      <app-footer [title]="'Reference Data' | translate"
                  (informationClick)="navigateToInformation()"></app-footer>
    </div>
  `
})
export class AppComponent {

  constructor(private locationService: LocationService,
              private router: Router,
              private configurationService: ConfigurationService) {
  }

  get loading() {
    return this.configurationService.loading;
  }

  get location() {
    return this.locationService.location;
  }

  navigateToInformation() {
    this.router.navigate(['/information']);
  }
}
