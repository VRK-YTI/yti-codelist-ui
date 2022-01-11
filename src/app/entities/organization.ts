import { labelNameToResourceIdIdentifier, Localizable, Localizer } from '@vrk-yti/yti-common-ui';
import { OrganizationType } from '../services/api-schema';

export class Organization {

  id: string;
  url: string;
  prefLabel: Localizable;
  description: Localizable;
  parent?: Organization;

  constructor(data: OrganizationType) {
    this.id = data.id;
    this.prefLabel = data.prefLabel || {};
    this.description = data.description || {};
    this.url = data.url;
    this.parent = data.parent ? new Organization(data.parent) : undefined;
  }

  getDisplayName(localizer: Localizer, useUILanguage: boolean = false): string {
    return localizer.translate(this.prefLabel, useUILanguage);
  }

  getEditModeDisplayName(localizer: Localizer, useUILanguage: boolean = false): string {
    const parentName = this.parent ? ` (${localizer.translate(this.parent.prefLabel, useUILanguage)})` : '';
    return this.getDisplayName(localizer, useUILanguage) + parentName;
  }

  getIdIdentifier(localizer: Localizer): string {
    const prefLabel = localizer.translate(this.prefLabel);
    return `${labelNameToResourceIdIdentifier(prefLabel)}`;
  }

  serialize(): OrganizationType {
    return {
      id: this.id,
      url: this.url,
      prefLabel: {...this.prefLabel},
      description: {...this.description},
      parent: this.parent
    };
  }

  clone(): Organization {
    return new Organization(this.serialize());
  }
}
