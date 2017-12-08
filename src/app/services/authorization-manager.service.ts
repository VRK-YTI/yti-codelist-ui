import { Injectable } from '@angular/core';
import { UserService, UUID } from 'yti-common-ui/services/user.service';
import { Organization } from '../entities/organization';

@Injectable()
export class AuthorizationManager {

  constructor(private userService: UserService) {
  }

  get user() {
    return this.userService.user;
  }

  canEdit(organizations: Organization[]): boolean {
    if (this.user.superuser) {
      return true;
    }
    const orgIds: UUID[] = organizations.map(org => org.id); 
    return this.user.isInOrganization(orgIds, ['ADMIN', 'CODE_LIST_EDITOR']);
  }
}
