import { Component, OnDestroy } from '@angular/core';
import { Role, UserService } from 'yti-common-ui/services/user.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { index } from 'yti-common-ui/utils/array';
import { Options } from 'yti-common-ui/components/dropdown.component';
import { comparingLocalizable } from 'yti-common-ui/utils/comparator';
import { TranslateService } from 'ng2-translate';
import { LanguageService } from '../../services/language.service';
import { LocationService } from '../../services/location.service';
import { DataService } from '../../services/data.service';
import { Organization } from '../../entities/organization';
import { combineSets, hasAny } from 'yti-common-ui/utils/set';
import { Observable } from 'rxjs/Observable';
import { labelNameToResourceIdIdentifier } from 'yti-common-ui/utils/resource';

interface UserOrganizationRoles {
  organization?: Organization;
  roles: Role[];
  requests: Role[];
}

@Component({
  selector: 'app-user-details',
  styleUrls: ['./user-details.component.scss'],
  templateUrl: './user-details.component.html',
})
export class UserDetailsComponent implements OnDestroy  {

  private subscriptionToClean: Subscription[] = [];

  allOrganizations: Organization[];
  allOrganizationsById: Map<string, Organization>;
  selectedOrganization: Organization|null = null;
  requestsInOrganizations = new Map<string, Set<Role>>();

  constructor(private router: Router,
              private userService: UserService,
              private locationService: LocationService,
              private dataService: DataService,
              private languageService: LanguageService,
              private translateService: TranslateService) {

    this.subscriptionToClean.push(this.userService.loggedIn$.subscribe(loggedIn => {
      if (!loggedIn) {
        router.navigate(['/']);
      }
    }));

    userService.updateLoggedInUser();

    locationService.atUserDetails();

    this.subscriptionToClean.push(
      Observable.combineLatest(this.dataService.getOrganizations(), languageService.language$)
        .subscribe(([organizations]) => {
          organizations.sort(comparingLocalizable<Organization>(languageService, org => org.prefLabel));
          this.allOrganizations = organizations;
          this.allOrganizationsById = index(organizations, org => org.id);
        })
    );

    this.refreshRequests();
  }

  ngOnDestroy() {
    this.subscriptionToClean.forEach(s => s.unsubscribe());
  }

  get user() {
    return this.userService.user;
  }

  get loading() {
    return !this.allOrganizations || !this.requestsInOrganizations;
  }

  get userOrganizations(): UserOrganizationRoles[] {

    const organizationIds = new Set<string>([
      ...Array.from(this.user.rolesInOrganizations.keys()),
      ...Array.from(this.requestsInOrganizations.keys())
    ]);

    const result = Array.from(organizationIds.values()).map(organizationId => {
      return {
        organization: this.allOrganizationsById.get(organizationId),
        roles: Array.from(this.user.getRoles(organizationId)),
        requests: Array.from(this.requestsInOrganizations.get(organizationId) || [])
      };
    });

    result.sort(comparingLocalizable<UserOrganizationRoles>(this.languageService, org => 
      org.organization ? org.organization.prefLabel : {}));

    return result;
  }

  get organizationOptions(): Options<Organization> {

    const hasExistingRoleOrRequest = (org: Organization) => {

      const rolesOrRequests = combineSets([
        this.user.getRoles(org.id),
        this.requestsInOrganizations.get(org.id) || new Set<Role>()
      ]);

      return hasAny(rolesOrRequests, ['CODE_LIST_EDITOR', 'ADMIN']);
    };

    const requestableOrganizations = this.allOrganizations.filter(organization => !hasExistingRoleOrRequest(organization));

    return [null, ...requestableOrganizations].map(org => {
      return {
        value: org,
        name: () => org ? this.languageService.translate(org.prefLabel, true)
                        : this.translateService.instant('Choose organization'),
        idIdentifier: () => org ? labelNameToResourceIdIdentifier(this.languageService.translate(org.prefLabel, true)) : 'all_selected'
      };
    });
  }

  sendRequest() {

    if (!this.selectedOrganization) {
      throw new Error('No organization selected for request');
    }

    this.dataService.sendUserRequest(this.selectedOrganization.id)
      .subscribe(() => this.refreshRequests());
  }

  refreshRequests() {

    this.selectedOrganization = null;

    this.dataService.getUserRequests().subscribe(userRequests => {

      this.requestsInOrganizations.clear();

      for (const userRequest of userRequests) {
        this.requestsInOrganizations.set(userRequest.organizationId, new Set<Role>(userRequest.role));
      }
    });
  }
}
