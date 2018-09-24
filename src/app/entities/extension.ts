import { Localizable, Localizer } from 'yti-common-ui/types/localization';
import { Location } from 'yti-common-ui/types/location';
import { formatDate, formatDateTime, formatDisplayDateTime, parseDate, parseDateTime } from '../utils/date';
import { EditableEntity } from './editable-entity';
import { restrictedStatuses, Status } from 'yti-common-ui/entities/status';
import { Moment } from 'moment';
import { ExtensionType } from '../services/api-schema';
import { hasLocalization } from 'yti-common-ui/utils/localization';
import { CodeScheme } from './code-scheme';
import { PropertyType } from './property-type';
import { contains, groupBy, index } from 'yti-common-ui/utils/array';
import { requireDefined } from 'yti-common-ui/utils/object';
import { TranslateService } from '@ngx-translate/core';

export class Extension implements EditableEntity {

  id: string;
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

  constructor(data: ExtensionType) {
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
      'extension',
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

  clone(): Extension {
    return new Extension(this.serialize());
  }
}

export interface PropertyTypeExtensions {
  label: string;
  extensions: Extension[];
}

export function groupByType(translateService: TranslateService, exts: Extension[]): PropertyTypeExtensions[] {

  const propertyTypes: PropertyType[] = exts.map(es => requireDefined(es.propertyType));
  const propertyTypesByName = index(propertyTypes, pt => pt.localName);
  const mapNormalizedType = (pt: PropertyType) => requireDefined(propertyTypesByName.get(pt.localName));

  return Array.from(groupBy(exts, es => mapNormalizedType(requireDefined(es.propertyType))))
    .map(([propertyType, extensions]) => ({ label: mapLocalNameToLabel(translateService, propertyType), extensions: extensions }));
}

export function mapLocalNameToLabel(translateService: TranslateService, propertyType: PropertyType): string {
  if (propertyType.localName === 'calculationHierarchy') {
    return translateService.instant('CALCULATIONHIERARCHIES');
  } else if (propertyType.localName === 'definitionHierarchy') {
    return translateService.instant('DEFINITIONHIERARCHIES');
  } else {
    return propertyType.localName;
  }
}
