import { Component } from '@angular/core';
import { LocationService } from '../services/location.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { Location } from '@vrk-yti/yti-common-ui';

@Component({
  selector: 'app-root',
  styleUrls: ['./app.component.scss'],
  templateUrl: './app.component.html',
})
export class AppComponent {

  constructor(private locationService: LocationService,
              private router: Router) {
  }

  get location(): Subject<Location[]> {

    return this.locationService.location;
  }

  navigateToInformation() {

    this.router.navigate(['/information']);
  }
}
