import { Injectable } from '@angular/core';
import { UserService } from 'yti-common-ui/services/user.service';
import { EditableEntity } from '../entities/editable-entity';
import { CodeRegistry } from '../entities/code-registry';
import {CodeScheme} from '../entities/code-scheme';

@Injectable()
export class AuthorizationManager {

  constructor(private userService: UserService) {
  }

  get user() {
    return this.userService.user;
  }

  canDelete(editableEntity: EditableEntity): boolean {
    if (this.user.superuser) {
      return true;
    }
    return this.user.isInOrganization(editableEntity.getOwningOrganizationIds(), ['ADMIN', 'CODE_LIST_EDITOR']);
  }

  canDeleteCodeScheme(codeScheme: CodeScheme): boolean {
    const userHasRight = this.user.isInOrganization(codeScheme.getOwningOrganizationIds(), ['ADMIN', 'CODE_LIST_EDITOR']);
    const isInDeletableState = codeScheme.isInDeletableState();
    return this.user.superuser || (userHasRight && isInDeletableState);
  }

  canEdit(editableEntity: EditableEntity): boolean {
    if (this.user.superuser) {
      return true;
    }
    if (editableEntity.allowOrganizationEdit()) {
      return this.user.isInOrganization(editableEntity.getOwningOrganizationIds(), ['ADMIN', 'CODE_LIST_EDITOR']);
    }
    return false;
  }

  filterAllowedRegistriesForUser(codeRegistries: CodeRegistry[]): CodeRegistry[] {
    return codeRegistries.filter(registry =>
      this.user.superuser || this.user.isInRole(['ADMIN', 'CODE_LIST_EDITOR'], registry.organizations.map(org => org.id)));
  }

  canCreateCodeScheme(codeRegistries: CodeRegistry[]) {

    const userRegistries = this.filterAllowedRegistriesForUser(codeRegistries);
    return this.user.superuser || (this.user.isInRoleInAnyOrganization(['ADMIN', 'CODE_LIST_EDITOR']) && userRegistries.length > 0);
  }
}
