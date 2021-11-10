import { formatDate, formatDateTime, formatDisplayDateTime, parseDate, parseDateTime } from '../utils/date';
import { Moment } from 'moment';
import { ExtensionSimpleType } from '../services/api-schema';
import { PropertyType } from './property-type';
import { Location, Localizable, Status, hasLocalization, contains, restrictedStatuses, Localizer } from '@vrk-yti/yti-common-ui';

export class ExtensionSimple {

  id: string;
  uri: string;
  url: string;
  codeValue: string;
  status: Status = 'DRAFT';
  startDate: Moment|null = null;
  endDate: Moment|null = null;
  propertyType: PropertyType;
  prefLabel: Localizable;
  modified: Moment|null = null;

  constructor(data: ExtensionSimpleType) {
    this.id = data.id;
    this.uri = data.uri;
    this.url = data.url;
    this.codeValue = data.codeValue;
    this.prefLabel = data.prefLabel || {};
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
  }

  get modifiedDisplayValue(): string {
    return formatDisplayDateTime(this.modified);
  }

  get route(): any[] {
    return [
      '/extension',
      {
        extensionCode: this.codeValue
      }
    ];
  }

  get location(): Location[] {
    return [{
      localizationKey: 'Extension',
      label: this.prefLabel,
      value: !hasLocalization(this.prefLabel) ? this.codeValue : '',
      route: this.route
    }];
  }

  get restricted() {
    return contains(restrictedStatuses, this.status);
  }

  serialize(): ExtensionSimpleType {
    return {
      id: this.id,
      uri: this.uri,
      url: this.url,
      codeValue: this.codeValue,
      propertyType: this.propertyType.serialize(),
      modified: formatDateTime(this.modified),
      prefLabel: { ...this.prefLabel },
      status: this.status,
      startDate: formatDate(this.startDate),
      endDate: formatDate(this.endDate),
    };
  }

  getDisplayName(localizer: Localizer, useUILanguage: boolean = false): string {
    const displayName = localizer.translate(this.prefLabel, useUILanguage);
    return displayName ? displayName : this.codeValue;
  }

  clone(): ExtensionSimple {
    return new ExtensionSimple(this.serialize());
  }
}
