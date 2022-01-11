import { Injectable } from '@angular/core';
import { EditableEntity } from '../entities/editable-entity';
import { CodeRegistry } from '../entities/code-registry';
import {CodeScheme} from '../entities/code-scheme';
import { UserService } from '@vrk-yti/yti-common-ui';
import { Organization } from '../entities/organization';

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
    return this.user.superuser || codeRegistries?.length > 0;
  }
}
