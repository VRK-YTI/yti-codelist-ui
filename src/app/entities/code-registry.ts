import { AbstractResource } from './abstract-resource';
import { Organization } from './organization';
import { CodeRegistryType } from '../services/api-schema';
import { formatDateTime } from '../utils/date';

export class CodeRegistry extends AbstractResource {

  organizations: Organization[];

  constructor(data: CodeRegistryType) {
    super(data);
    this.organizations = (data.organizations || []).map(o => new Organization(o));
  }

  serialize(): CodeRegistryType {

    return {
      id: this.id,
      uri: this.uri,
      url: this.url,
      codeValue: this.codeValue,
      modified: formatDateTime(this.modified),
      prefLabel: { ...this.prefLabel },
      organizations: this.organizations.map(o => o.serialize())
    };
  }
}
