import { Localizable, Localizer } from 'yti-common-ui/types/localization';
import { OrganizationType } from '../services/api-schema';

export class Organization {

  id: string;
  url: string;
  prefLabel: Localizable;
  description: Localizable;

  constructor(data: OrganizationType) {
    this.id = data.id;
    this.prefLabel = data.prefLabel || {};
    this.description = data.description || {};
    this.url = data.url;
  }

  getDisplayName(localizer: Localizer, useUILanguage: boolean = false): string {
    return localizer.translate(this.prefLabel, useUILanguage);
  }

  serialize(): OrganizationType {
    return {
      id: this.id,
      url: this.url,
      prefLabel: {...this.prefLabel},
      description: {...this.description}
    };
  }

  clone(): Organization {
    return new Organization(this.serialize());
  }
}
