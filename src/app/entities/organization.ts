import { Localizable } from 'yti-common-ui/types/localization';
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

  serialize(): OrganizationType {
    return {
      id: this.id,
      url: this.url,
      prefLabel: { ...this.prefLabel },
      description: { ...this.description }
    };
  }
}
