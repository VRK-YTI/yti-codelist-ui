import { AbstractResource } from './abstract-resource';
import { Localizable } from 'yti-common-ui/types/localization';
import { Location } from 'yti-common-ui/types/location';
import { CodeRegistry } from './code-registry';
import { formatDate, formatDateTime, formatDisplayDate, formatDisplayDateTime, parseDate } from '../utils/date';
import { ExternalReference } from './external-reference';
import { EditableEntity } from './editable-entity';
import { Status, restrictedStatuses } from 'yti-common-ui/entities/status';
import { Moment } from 'moment';
import { CodeSchemeType } from '../services/api-schema';
import { DataClassification } from './data-classification';
import { contains } from 'yti-common-ui/utils/array';

export class CodeScheme extends AbstractResource implements EditableEntity {

  version: string;
  source: string;
  status: Status = 'DRAFT';
  legalBase: string;
  governancePolicy: string;
  startDate: Moment|null = null;
  endDate: Moment|null = null;
  codeRegistry: CodeRegistry;
  description: Localizable = {};
  changeNote: Localizable = {};
  definition: Localizable = {};
  dataClassifications: DataClassification[] = [];
  externalReferences: ExternalReference[] = [];

  constructor(data: CodeSchemeType) {
    super(data);

    this.version = data.version;
    this.source = data.source;
    if (data.status) {
      this.status = data.status;
    }
    this.legalBase = data.legalBase;
    this.governancePolicy = data.governancePolicy;
    if (data.startDate) {
      this.startDate = parseDate(data.startDate);
    }
    if (data.endDate) {
      this.endDate = parseDate(data.endDate);
    }
    this.codeRegistry = new CodeRegistry(data.codeRegistry);
    this.description = data.description || {};
    this.changeNote = data.changeNote || {};
    this.definition = data.definition || {};
    this.dataClassifications = (data.dataClassifications || []).map(dc => new DataClassification(dc));
    this.externalReferences = (data.externalReferences || []).map(er => new ExternalReference(er));
  }

  get validity(): string {
    return `${formatDisplayDate(this.startDate)} - ${formatDisplayDate(this.endDate)}`;
  }

  get modifiedDisplayValue(): string {
    return formatDisplayDateTime(this.modified);
  }

  get route(): any[] {
    return [
      'codescheme',
      {
        codeRegistryCodeValue: this.codeRegistry.codeValue,
        codeSchemeId: this.id
      }
    ];
  }

  get location(): Location[] {
    return [{
      localizationKey: 'Code list',
      label: this.prefLabel,
      route: this.route
    }];
  }

  get restricted() {
    return contains(restrictedStatuses, this.status);
  }

  getOwningOrganizationIds(): string[] {
    return this.codeRegistry.organizations.map(org => org.id);
  }

  serialize(): CodeSchemeType {
    return {
      id: this.id,
      uri: this.uri,
      codeValue: this.codeValue,
      modified: formatDateTime(this.modified),
      prefLabel: { ...this.prefLabel },
      version: this.version,
      source: this.source,
      status: this.status,
      legalBase: this.legalBase,
      governancePolicy: this.governancePolicy,
      startDate: formatDate(this.startDate),
      endDate: formatDate(this.endDate),
      codeRegistry: this.codeRegistry.serialize(),
      description: { ...this.description },
      changeNote: { ...this.changeNote },
      definition: { ...this.definition },
      dataClassifications: this.dataClassifications.map(dc => dc.serialize()),
      externalReferences: this.externalReferences.map(er => er.serialize())
    };
  }

  clone(): CodeScheme {
    return new CodeScheme(this.serialize());
  }
}
