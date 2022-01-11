import { AbstractResource } from './abstract-resource';
import { CodeRegistry } from './code-registry';
import { formatDate, formatDateTime, formatDisplayDateTime, parseDate, parseDateTime } from '../utils/date';
import { ExternalReference } from './external-reference';
import { EditableEntity } from './editable-entity';
import { Moment } from 'moment';
import { CodeSchemeType } from '../services/api-schema';
import { CodePlain } from './code-simple';
import { ExtensionSimple } from './extension-simple';
import { CodeSchemeListItem } from './code-scheme-list-item';
import { Organization } from './organization';
import { SearchHit } from './search-hit';
import { Location, Localizable, Status, hasLocalization, contains, restrictedStatuses, Localizer } from '@vrk-yti/yti-common-ui';
import { getAllOrganizationIds, getMainOrganizations } from './entity-utils';

export class CodeScheme extends AbstractResource implements EditableEntity {

  version: string;
  source: string;
  status: Status = 'DRAFT';
  legalBase: string;
  governancePolicy: string;
  startDate: Moment | null = null;
  endDate: Moment | null = null;
  codeRegistry: CodeRegistry;
  description: Localizable = {};
  changeNote: Localizable = {};
  definition: Localizable = {};
  infoDomains: CodePlain[] = [];
  languageCodes: CodePlain[] = [];
  externalReferences: ExternalReference[] = [];
  conceptUriInVocabularies: string;
  modified: Moment | null = null;
  defaultCode: CodePlain | null = null;
  extensions: ExtensionSimple[] = [];
  variantsOfThisCodeScheme: CodeSchemeListItem[] = [];
  variantMothersOfThisCodeScheme: CodeSchemeListItem[] = [];
  nextCodeschemeId: string | null = null; // these IDs have to flow thru the UI as well, otherwise dataloss ensues
  prevCodeschemeId: string | null = null;
  lastCodeschemeId: string | null = null;
  allVersions: CodeSchemeListItem[] = [];
  organizations: Organization[];
  searchHitsOfTheTypeCode: SearchHit[];
  totalNrOfSearchHitsCodes: number;
  totalNrOfSearchHitsExtensions: number;
  searchHitsOfTheTypeExtension: SearchHit[];
  cumulative: boolean;
  feedbackChannel: string;

  constructor(data: CodeSchemeType) {
    super(data);

    if (data.modified) {
      this.modified = parseDateTime(data.modified);
    }
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
    this.infoDomains = (data.infoDomains || []).map(dc => new CodePlain(dc));
    this.languageCodes = (data.languageCodes || []).map(lc => new CodePlain(lc));
    this.externalReferences = (data.externalReferences || []).map(er => new ExternalReference(er));
    this.extensions = (data.extensions || []).map(es => new ExtensionSimple(es));
    this.conceptUriInVocabularies = data.conceptUriInVocabularies;
    if (data.defaultCode) {
      this.defaultCode = new CodePlain(data.defaultCode);
    }
    if (data.variantsOfThisCodeScheme) {
      this.variantsOfThisCodeScheme = (data.variantsOfThisCodeScheme || []).map(variant => new CodeSchemeListItem(variant));
    }
    if (data.variantMothersOfThisCodeScheme) {
      this.variantMothersOfThisCodeScheme = (data.variantMothersOfThisCodeScheme || []).map(variant => new CodeSchemeListItem(variant));
    }
    if (data.allVersions) {
      this.allVersions = (data.allVersions || []).map(version => new CodeSchemeListItem(version));
    }
    if (data.nextCodeschemeId) {
      this.nextCodeschemeId = data.nextCodeschemeId;
    }
    if (data.prevCodeschemeId) {
      this.prevCodeschemeId = data.prevCodeschemeId;
    }
    if (data.lastCodeschemeId) {
      this.lastCodeschemeId = data.lastCodeschemeId;
    }
    this.organizations = (data.organizations || []).map(o => new Organization(o));
    this.searchHitsOfTheTypeCode = (data.searchHits || []).map(sh => new SearchHit(sh)).filter(sh => sh.type === 'code');
    this.searchHitsOfTheTypeExtension = (data.searchHits || []).map(sh => new SearchHit(sh)).filter(sh => sh.type === 'extension');
    this.totalNrOfSearchHitsCodes = data.totalNrOfSearchHitsCodes;
    this.totalNrOfSearchHitsExtensions = data.totalNrOfSearchHitsExtensions;
    this.cumulative = data.cumulative;
    this.feedbackChannel = data.feedbackChannel;
  }

  get modifiedDisplayValue(): string {
    return formatDisplayDateTime(this.modified);
  }

  get route(): any[] {
    return [
      '/codescheme',
      {
        registryCode: this.codeRegistry.codeValue,
        schemeCode: this.codeValue
      }
    ];
  }

  get location(): Location[] {
    return [
      ...this.codeRegistry.location,
      {
        localizationKey: 'Code list',
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
    return `${this.codeRegistry.codeValue}_${this.codeValue}`;
  }

  get mainOrganizations(): Organization[] {
    return getMainOrganizations(this.organizations);
  }

  getOwningOrganizationIds(): string[] {
    return getAllOrganizationIds(this.organizations);
  }

  getDisplayInfoDomainListing(localizer: Localizer, useUILanguage: boolean = false): string[] {
    const results: string[] = [];
    this.infoDomains.forEach((dc) => {
      const displayInfoDomain = localizer.translate(dc.prefLabel, useUILanguage);
      if (displayInfoDomain) {
        results.push(displayInfoDomain);
      }
    });
    return results;
  }

  get searchHitsMax6OfTheTypeCode() {
    return this.searchHitsOfTheTypeCode.slice(0, 6);
  }

  get searchHitsMax6OfTheTypeExtension() {
    return this.searchHitsOfTheTypeExtension.slice(0, 6);
  }

  allowOrganizationEdit(): boolean {
    return true;
  }

  isInDeletableState() {
    return contains(['INCOMPLETE', 'DRAFT', 'SUGGESTED'], this.status);
  }

  serialize(): CodeSchemeType {

    return {
      id: this.id,
      uri: this.uri,
      url: this.url,
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
      infoDomains: this.infoDomains.map(dc => dc.serialize()),
      languageCodes: this.languageCodes.map(lc => lc.serialize()),
      externalReferences: this.externalReferences.map(er => er.serialize()),
      extensions: this.extensions.map(es => es.serialize()),
      conceptUriInVocabularies: this.conceptUriInVocabularies,
      defaultCode: this.defaultCode ? this.defaultCode.serialize() : undefined,
      variantsOfThisCodeScheme: this.variantsOfThisCodeScheme.map(v => v.serialize()),
      variantMothersOfThisCodeScheme: this.variantMothersOfThisCodeScheme.map(vm => vm.serialize()),
      nextCodeschemeId: this.nextCodeschemeId,
      prevCodeschemeId: this.prevCodeschemeId,
      lastCodeschemeId: this.lastCodeschemeId,
      allVersions: this.allVersions.map(li => li.serialize()),
      organizations: this.organizations.map(o => o.serialize()),
      searchHits: [], // this is not really a part of codescheme, never getting stored, so lets send nothing
      totalNrOfSearchHitsCodes: this.totalNrOfSearchHitsCodes,
      totalNrOfSearchHitsExtensions: this.totalNrOfSearchHitsExtensions,
      cumulative: this.cumulative,
      feedbackChannel: this.feedbackChannel
    };
  }

  clone(): CodeScheme {
    return new CodeScheme(this.serialize());
  }
}
