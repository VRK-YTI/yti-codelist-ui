import { AbstractResource } from './abstract-resource';
import { CodeScheme } from './code-scheme';
import { formatDate, formatDateTime, formatDisplayDateTime, parseDate, parseDateTime } from '../utils/date';
import { EditableEntity } from './editable-entity';
import { ExternalReference } from './external-reference';
import { Moment } from 'moment';
import { CodePlainType, CodeType } from '../services/api-schema';
import { CodePlain } from './code-simple';
import { Extension } from './extension';
import { Location, Localizable, Status, hasLocalization, contains, restrictedStatuses, Localizer } from '@vrk-yti/yti-common-ui';
import { getAllOrganizationIds } from './entity-utils';

export class Code extends AbstractResource implements EditableEntity {

  codeScheme: CodeScheme;
  shortName: string;
  status: Status = 'DRAFT';
  startDate: Moment | null = null;
  endDate: Moment | null = null;
  description: Localizable = {};
  definition: Localizable = {};
  externalReferences: ExternalReference[] = [];
  broaderCode: CodePlain | null = null;
  hierarchyLevel: number;
  expanded: boolean;
  conceptUriInVocabularies: string;
  modified: Moment | null = null;
  order: string;
  codeExtensions: Extension[] = [];
  subCodeScheme?: CodeScheme;

  constructor(data: CodeType) {
    super(data);

    if (data.modified) {
      this.modified = parseDateTime(data.modified);
    }
    this.codeScheme = new CodeScheme(data.codeScheme);
    this.shortName = data.shortName;
    if (data.status) {
      this.status = data.status;
    }
    if (data.startDate) {
      this.startDate = parseDate(data.startDate);
    }
    if (data.endDate) {
      this.endDate = parseDate(data.endDate);
    }
    this.description = data.description || {};
    this.definition = data.definition || {};
    this.externalReferences = (data.externalReferences || []).map(er => new ExternalReference(er));
    if (data.hierarchyLevel) {
      this.hierarchyLevel = data.hierarchyLevel;
    }
    this.expanded = false;
    if (data.conceptUriInVocabularies) {
      this.conceptUriInVocabularies = data.conceptUriInVocabularies;
    }
    if (data.order) {
      this.order = data.order;
    }
    if (data.broaderCode) {
      this.broaderCode = new CodePlain(data.broaderCode);
    }
    if (data.codeExtensions) {
      this.codeExtensions = data.codeExtensions.map(ie => new Extension(ie));
    }
    if (data.subCodeScheme) {
      this.subCodeScheme = new CodeScheme(data.subCodeScheme);
    }
  }

  get registryCode() {
    return this.codeScheme.codeRegistry.codeValue;
  }

  get schemeCode() {
    return this.codeScheme.codeValue;
  }

  get modifiedDisplayValue(): string {
    return formatDisplayDateTime(this.modified);
  }

  get route(): any[] {
    return [
      '/code',
      {
        registryCode: this.registryCode,
        schemeCode: this.schemeCode,
        codeCode: this.codeValue
      }
    ];
  }

  get location(): Location[] {
    return [
      ...this.codeScheme.location,
      {
        localizationKey: 'Code',
        label: this.prefLabel,
        value: !hasLocalization(this.prefLabel) ? this.codeValue : '',
        route: this.route
      }
    ];
  }

  get restricted() {
    return contains(restrictedStatuses, this.status);
  }

  get idIdentifier(): string {
    return `${this.codeScheme.codeRegistry.codeValue}_${this.codeScheme.codeValue}_${this.codeValue}`;
  }

  getOwningOrganizationIds(): string[] {
    return getAllOrganizationIds(this.codeScheme.organizations);
  }

  allowOrganizationEdit(): boolean {
    return true;
  }

  serialize(): CodeType {
    return {
      id: this.id,
      uri: this.uri,
      url: this.url,
      codeValue: this.codeValue,
      modified: formatDateTime(this.modified),
      prefLabel: { ...this.prefLabel },
      codeScheme: this.codeScheme.serialize(),
      shortName: this.shortName,
      status: this.status,
      startDate: formatDate(this.startDate),
      endDate: formatDate(this.endDate),
      description: { ...this.description },
      definition: { ...this.definition },
      externalReferences: this.externalReferences.map(er => er.serialize()),
      broaderCode: this.broaderCode ? this.broaderCode.serialize() : undefined,
      hierarchyLevel: this.hierarchyLevel,
      conceptUriInVocabularies: this.conceptUriInVocabularies,
      order: this.order,
      codeExtensions: this.codeExtensions ? this.codeExtensions.map(ie => ie.serialize()) : undefined,
      subCodeScheme: this.subCodeScheme ? this.subCodeScheme.serialize() : undefined
    };
  }

  serializeToPlainType(): CodePlainType {
    return {
      id: this.id,
      uri: this.uri,
      url: this.url,
      codeValue: this.codeValue,
      prefLabel: {...this.prefLabel},
      status: this.status,
      broaderCode: this.broaderCode ? this.broaderCode.serialize() : undefined,
      hierarchyLevel: this.hierarchyLevel
    };
  }

  getDisplayNameWithCodeSchemeAndRegistry(localizer: Localizer, useUILanguage: boolean = false): string {
    let displayName = localizer.translate(this.prefLabel, useUILanguage);
    if (displayName) {
      displayName = this.codeValue + ' - ' + displayName;
    } else {
      displayName = this.codeValue;
    }
    displayName = displayName + ' - ' + this.codeScheme.getDisplayName(localizer, useUILanguage) + ' - ' + this.codeScheme.codeRegistry.getDisplayName(localizer, useUILanguage);
    return displayName;
  }

  clone(): Code {
    return new Code(this.serialize());
  }
}
