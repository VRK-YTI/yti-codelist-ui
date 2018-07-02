import { AbstractResource } from './abstract-resource';
import { Organization } from './organization';
import { CodeRegistryType } from '../services/api-schema';
import { Location } from 'yti-common-ui/types/location';
import { hasLocalization } from 'yti-common-ui/utils/localization';
import { EditableEntity } from './editable-entity';
import { formatDateTime, formatDisplayDateTime, parseDateTime } from '../utils/date';
import { Moment } from 'moment';

export class CodeRegistry extends AbstractResource implements EditableEntity {

  organizations: Organization[];
  modified: Moment|null = null;

  constructor(data: CodeRegistryType) {
    super(data);
    if (data.modified) {
      this.modified = parseDateTime(data.modified);
    }
    this.organizations = (data.organizations || []).map(o => new Organization(o));
  }

  serialize(): CodeRegistryType {

    return {
      id: this.id,
      uri: this.uri,
      url: this.url,
      codeValue: this.codeValue,
      modified: formatDateTime(this.modified),
      prefLabel: {...this.prefLabel},
      organizations: this.organizations.map(o => o.serialize())
    };
  }

  get location(): Location[] {
    return [{
      localizationKey: 'Registry',
      label: this.prefLabel,
      value: !hasLocalization(this.prefLabel) ? this.codeValue : '',
      route: this.route
    }];
  }

  get route(): any[] {
    return [
      'registry',
      {
        registryCode: this.codeValue,
      }
    ];
  }

  get modifiedDisplayValue(): string {
    return formatDisplayDateTime(this.modified);
  }

  get idIdentifier(): string {
    return `${this.codeValue}`;
  }

  getOwningOrganizationIds(): string[] {
    return this.organizations.map(org => org.id);
  }

  allowOrganizationEdit(): boolean {
    return false;
  }

  clone(): CodeRegistry {
    return new CodeRegistry(this.serialize());
  }
}
