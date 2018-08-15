import { Component } from '@angular/core';
import { Language, LanguageService } from '../../services/language.service';
import { UserService } from 'yti-common-ui/services/user.service';
import { LoginModalService } from 'yti-common-ui/components/login-modal.component';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-navigation-bar',
  styleUrls: ['./navigation-bar.component.scss'],
  templateUrl: './navigation-bar.component.html',
})
export class NavigationBarComponent {

  availableLanguages = [
    { code: 'fi' as Language, name: 'Suomeksi (FI)' },
    // { code: 'sv' as Language, name: 'På svenska (SV)' },
    { code: 'en' as Language, name: 'In English (EN)' }
  ];

  fakeableUsers: { email: string, firstName: string, lastName: string }[] = [];

  groupManagementUrl: string;
  terminologyUrl: string;
  dataModelUrl: string;

  constructor(public languageService: LanguageService,
              private userService: UserService,
              private loginModal: LoginModalService,
              private dataService: DataService) {

    dataService.getFakeableUsers().subscribe(users => {
      this.fakeableUsers = users;
    });

    dataService.getServiceConfiguration().subscribe(configuration => {
      this.groupManagementUrl = configuration.groupManagementConfig.url;
      this.terminologyUrl = configuration.terminologyConfig.url;
      this.dataModelUrl = configuration.dataModelConfig.url;
    });
  }

  get noMenuItemsAvailable() {
    return true;
  }

  logIn() {
    this.loginModal.open();
  }

  logOut() {
    this.userService.logout();
  }

  get user() {
    return this.userService.user;
  }

  isLoggedIn() {
    return this.userService.isLoggedIn();
  }

  set language(language: Language) {
    this.languageService.language = language;
  }

  get language(): Language {
    return this.languageService.language;
  }

  isLanguageSelected(language: Language) {
    return language === this.language;
  }

  fakeUser(userEmail: string) {
    const oldEmail = this.user.email;
    if (oldEmail !== userEmail) {
      this.userService.updateLoggedInUser(userEmail);
      this.refreshPageOnUserUpdate(userEmail);
    }
  }

  refreshPageOnUserUpdate(userEmail: string) {
    setTimeout(() => {
      if (this.user.email === userEmail) {
        window.location.reload();
      } else {
        this.refreshPageOnUserUpdate(userEmail);
      }
    }, 500);
  }

  showGroupManagementUrl() {
    return this.user.superuser || this.user.isAdminInAnyOrganization();
  }
}
