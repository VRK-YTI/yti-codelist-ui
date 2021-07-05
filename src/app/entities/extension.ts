import { formatDate, formatDateTime, formatDisplayDateTime, parseDate, parseDateTime } from '../utils/date';
import { EditableEntity } from './editable-entity';
import { Moment } from 'moment';
import { ExtensionSimpleType, ExtensionType } from '../services/api-schema';
import { CodeScheme } from './code-scheme';
import { PropertyType } from './property-type';
import { TranslateService } from '@ngx-translate/core';
import { MemberSimple } from './member-simple';
import { Location, Localizable, Status, hasLocalization, contains, restrictedStatuses, Localizer, requireDefined, index, groupBy } from '@vrk-yti/yti-common-ui';

export class Extension implements EditableEntity {

  id: string;
  uri: string;
  url: string;
  codeValue: string;
  status: Status = 'DRAFT';
  startDate: Moment | null = null;
  endDate: Moment | null = null;
  parentCodeScheme: CodeScheme;
  propertyType: PropertyType;
  codeSchemes: CodeScheme[] = [];
  prefLabel: Localizable;
  modified: Moment | null = null;
  members: MemberSimple[] = [];

  constructor(data: ExtensionType) {
    this.id = data.id;
    this.uri = data.uri;
    this.url = data.url;
    this.codeValue = data.codeValue;
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
    if (data.parentCodeScheme) {
      this.parentCodeScheme = new CodeScheme(data.parentCodeScheme);
    }
    if (data.members) {
      this.members = data.members.map(member => new MemberSimple(member));
    }
  }

  get modifiedDisplayValue(): string {
    return formatDisplayDateTime(this.modified);
  }

  get route(): any[] {
    return [
      '/extension',
      {
        registryCode: this.parentCodeScheme.codeRegistry.codeValue,
        schemeCode: this.parentCodeScheme.codeValue,
        extensionCode: this.codeValue
      }
    ];
  }

  get location(): Location[] {
    return [
      ...this.parentCodeScheme.location,
      {
        localizationKey: 'Extension',
        label: this.prefLabel,
        value: !hasLocalization(this.prefLabel) ? this.codeValue : '',
        route: this.route
      }];
  }

  getOwningOrganizationIds(): string[] {
    return this.parentCodeScheme.organizations.map(org => org.id);
  }

  allowOrganizationEdit(): boolean {
    return true;
  }

  get restricted() {
    return contains(restrictedStatuses, this.status);
  }

  serialize(): ExtensionType {
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
      parentCodeScheme: this.parentCodeScheme ? this.parentCodeScheme.serialize() : undefined,
      codeSchemes: this.codeSchemes.map(cs => cs.serialize()),
      members: this.members ? this.members.map(member => member.serialize()) : undefined
    };
  }

  serializeAsSimpleType(): ExtensionSimpleType {
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
      endDate: formatDate(this.endDate)
    };
  }

  getDisplayName(localizer: Localizer, useUILanguage: boolean = false): string {
    const displayName = localizer.translate(this.prefLabel, useUILanguage);
    return displayName ? displayName : this.codeValue;
  }

  hasPrefLabel() {
    return hasLocalization(this.prefLabel);
  }

  clone(): Extension {
    return new Extension(this.serialize());
  }
}

export interface PropertyTypeExtensions {
  label: string;
  extensions: Extension[];
  localNameForId: string;
}

export function groupByType(translateService: TranslateService, exts: Extension[]): PropertyTypeExtensions[] {

  const propertyTypes: PropertyType[] = exts.map(es => requireDefined(es.propertyType));
  const propertyTypesByName = index(propertyTypes, pt => pt.localName);
  const mapNormalizedType = (pt: PropertyType) => requireDefined(propertyTypesByName.get(pt.localName));

  return Array.from(groupBy(exts, es => mapNormalizedType(requireDefined(es.propertyType))))
    .map(([propertyType, extensions]) => ({ label: mapLocalNameToLabel(translateService, propertyType), localNameForId: propertyType.localName, extensions: extensions }));
}

export function mapLocalNameToLabel(translateService: TranslateService, propertyType: PropertyType): string {
  if (propertyType.localName === 'calculationHierarchy') {
    return translateService.instant('CALCULATIONHIERARCHIES');
  } else if (propertyType.localName === 'definitionHierarchy') {
    return translateService.instant('DEFINITIONHIERARCHIES');
  } else if (propertyType.localName === 'crossReferenceList') {
    return translateService.instant('CROSSREFERENCELISTS');
  } else {
    return propertyType.localName;
  }
}
