import { Localizable, Localizer } from 'yti-common-ui/types/localization';
import { Location } from 'yti-common-ui/types/location';
import { formatDate, formatDateTime, formatDisplayDateTime, parseDate, parseDateTime } from '../utils/date';
import { EditableEntity } from './editable-entity';
import { restrictedStatuses, Status } from 'yti-common-ui/entities/status';
import { Moment } from 'moment';
import { ExtensionSchemeType } from '../services/api-schema';
import { hasLocalization } from 'yti-common-ui/utils/localization';
import { CodeScheme } from './code-scheme';
import { PropertyType } from './property-type';
import { contains } from 'yti-common-ui/utils/array';

export class ExtensionScheme implements EditableEntity {

  id: string;
  url: string;
  codeValue: string;
  status: Status = 'DRAFT';
  startDate: Moment|null = null;
  endDate: Moment|null = null;
  parentCodeScheme: CodeScheme;
  propertyType: PropertyType;
  codeSchemes: CodeScheme[];
  prefLabel: Localizable;
  modified: Moment|null = null;

  constructor(data: ExtensionSchemeType) {
    this.id = data.id;
    this.codeValue = data.codeValue;
    this.url = data.url;
    this.prefLabel = data.prefLabel || {};
    if (data.status) {
      this.status = data.status;
    }
    this.propertyType = new PropertyType(data.propertyType);
    if (data.modified) {
      this.modified = parseDateTime(data.modified);
    }
    if (data.startDate) {
      this.startDate = parseDate(data.startDate);
    }
    if (data.endDate) {
      this.endDate = parseDate(data.endDate);
    }
    this.codeSchemes = (data.codeSchemes || []).map(cs => new CodeScheme(cs));
    this.parentCodeScheme = new CodeScheme(data.parentCodeScheme);
  }

  get modifiedDisplayValue(): string {
    return formatDisplayDateTime(this.modified);
  }

  get route(): any[] {
    return [
      'extensionscheme',
      {
        registryCode: this.parentCodeScheme.codeRegistry.codeValue,
        schemeCode: this.parentCodeScheme.codeValue,
        extensionSchemeCode: this.codeValue
      }
    ];
  }

  get location(): Location[] {
    return [
      ...this.parentCodeScheme.location,
      {
      localizationKey: 'Extension scheme',
      label: this.prefLabel,
      value: !hasLocalization(this.prefLabel) ? this.codeValue : '',
      route: this.route
    }];
  }

  getOwningOrganizationIds(): string[] {
    return this.parentCodeScheme.codeRegistry.organizations.map(org => org.id);
  }

  get restricted() {
    return contains(restrictedStatuses, this.status);
  }

  serialize(): ExtensionSchemeType {
    return {
      id: this.id,
      url: this.url,
      codeValue: this.codeValue,
      propertyType: this.propertyType.serialize(),
      modified: formatDateTime(this.modified),
      prefLabel: { ...this.prefLabel },
      status: this.status,
      startDate: formatDate(this.startDate),
      endDate: formatDate(this.endDate),
      parentCodeScheme: this.parentCodeScheme.serialize(),
      codeSchemes: this.codeSchemes.map(cs => cs.serialize())
    };
  }

  getDisplayName(localizer: Localizer, useUILanguage: boolean = false): string {
    const displayName = localizer.translate(this.prefLabel, useUILanguage);
    return displayName ? displayName : this.codeValue;
  }

  hasPrefLabel() {
    return hasLocalization(this.prefLabel);
  }

  clone(): ExtensionScheme {
    return new ExtensionScheme(this.serialize());
  }
}
