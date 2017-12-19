import { Component, OnDestroy } from '@angular/core';
import { Role, UserService } from 'yti-common-ui/services/user.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TranslateService } from 'ng2-translate';
import { LanguageService } from '../../services/language.service';
import { LocationService } from '../../services/location.service';

@Component({
  selector: 'app-user-details',
  styleUrls: ['./user-details.component.scss'],
  templateUrl: './user-details.component.html',
})
export class UserDetailsComponent implements OnDestroy  {

  private loggedInSubscription: Subscription;

  constructor(private router: Router,
              private userService: UserService,
              private locationService: LocationService,
              private languageService: LanguageService,
              private translateService: TranslateService) {

    this.loggedInSubscription = this.userService.loggedIn$.subscribe(loggedIn => {
      if (!loggedIn) {
        router.navigate(['/']);
      }
    });

    locationService.atUserDetails();
  }

  ngOnDestroy() {
    this.loggedInSubscription.unsubscribe();
  }

  get user() {
    return this.userService.user;
  }

  get loading() {
    return false;
  }

}
