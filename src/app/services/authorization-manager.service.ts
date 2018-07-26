import { Injectable } from '@angular/core';
import { UserService } from 'yti-common-ui/services/user.service';
import { EditableEntity } from '../entities/editable-entity';
import { CodeRegistry } from '../entities/code-registry';

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

  canCreateACodeSchemeOrAVersionAndAttachAVariant(codeRegistries: CodeRegistry[]) {

    const userRegistries = this.filterAllowedRegistriesForUser(codeRegistries);
    return this.user.superuser || (this.user.isInRoleInAnyOrganization(['ADMIN', 'CODE_LIST_EDITOR']) && userRegistries.length > 0);
  }
}
