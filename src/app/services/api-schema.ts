import { Localizable } from 'yti-common-ui/types/localization';
import { Status } from 'yti-common-ui/entities/status';

export interface ApiResponseType {

  meta: MetaType;
}

export interface BaseResourceType {

  id: string;
  uri: string;
  url: string;
  codeValue: string;
  prefLabel?: Localizable;
}

export interface CodeRegistryType extends BaseResourceType {

  modified?: string;
  description?: Localizable;
  organizations: OrganizationType[];
}

export interface CodeSchemeType extends BaseResourceType {

  modified?: string;
  version: string;
  source: string;
  status: Status;
  legalBase: string;
  governancePolicy: string;
  startDate?: string;
  endDate?: string;
  codeRegistry: CodeRegistryType;
  description?: Localizable;
  changeNote?: Localizable;
  definition?: Localizable;
  infoDomains: CodePlainType[];
  languageCodes: CodePlainType[];
  externalReferences?: ExternalReferenceType[];
  extensions?: ExtensionSimpleType[];
  conceptUriInVocabularies: string;
  defaultCode?: CodePlainType;
  variantsOfThisCodeScheme?: CodeSchemeListItemType[];
  variantMothersOfThisCodeScheme?: CodeSchemeListItemType[];
  allVersions?: CodeSchemeListItemType[];
  nextCodeschemeId: string | null;
  prevCodeschemeId: string | null;
  lastCodeschemeId: string | null;
  organizations: OrganizationType[];
  searchHits: SearchHitType[];
  totalNrOfSearchHitsCodes: number;
  totalNrOfSearchHitsExtensions: number;
  cumulative: boolean;
  feedbackChannel: string;
}

export interface CodePlainType extends BaseResourceType {

  status: Status;
  broaderCode?: CodePlainType;
  hierarchyLevel?: number;
}

export interface CodePlainWithCodeSchemeType extends CodePlainType {

  codeScheme?: CodeSchemeType;
}

export interface CodeType extends BaseResourceType {

  modified?: string;
  codeScheme: CodeSchemeType;
  shortName: string;
  status: Status;
  startDate?: string;
  endDate?: string;
  description?: Localizable;
  definition?: Localizable;
  externalReferences?: ExternalReferenceType[];
  broaderCode?: CodePlainType;
  hierarchyLevel?: number;
  conceptUriInVocabularies: string;
  order?: string;
  codeExtensions?: ExtensionType[];
  subCodeScheme?: CodeSchemeType;
}

export interface MetaType {

  message: string,
  code: number,
  entityIdentifier?: string,
  nonTranslatableMessage?: string
  totalResults: number;
  resultCount: number;
  from: number;
}

export interface ConceptResponseType {

  meta: MetaType;
  results: ConceptType[];
}

export interface ConceptType {

  id: string;
  prefLabel: Localizable;
  description: Localizable;
  vocabularyPrefLabel: Localizable;
  container: string;
  uri: string;
  status: string;
}

export interface ConceptSuggestionType {

  prefLabel: Localizable;
  definition: Localizable;
  creator?: string;
  terminologyUri: string;
  uri?: string;
}

export interface VocabularyType {

  uri: string;
  prefLabel: Localizable;
  description: Localizable;
  status: string;
  languages: string[];
}

export interface ExternalReferenceType {

  modified?: string;
  id: string;
  url: string;
  href: string;
  global: boolean;
  title?: Localizable;
  description?: Localizable;
  propertyType?: PropertyTypeType;
}

export interface PropertyTypeType {

  id: string;
  prefLabel: Localizable;
  definition: Localizable;
  localName: string;
  url: string;
  uri: string;
  context: string;
  externaluri: string;
  valueTypes?: ValueTypeType[];
}

export interface InfoDomainType {

  id: string;
  uri: string;
  status: string;
  codeValue: string;
  prefLabel: Localizable;
  count: number;
}

export interface OrganizationType {

  id: string;
  prefLabel: Localizable;
  description: Localizable;
  url: string;
}

export interface ExtensionType {

  id: string;
  uri: string;
  url: string;
  codeValue: string;
  propertyType: PropertyTypeType;
  prefLabel?: Localizable;
  modified?: string;
  status: Status;
  startDate?: string;
  endDate?: string;
  parentCodeScheme?: CodeSchemeType;
  codeSchemes?: CodeSchemeType[];
  description?: Localizable;
  members?: MemberSimpleType[];
}

export interface ExtensionSimpleType {

  id: string;
  uri: string;
  url: string;
  codeValue: string;
  propertyType: PropertyTypeType;
  prefLabel?: Localizable;
  modified?: string;
  status: Status;
  startDate?: string;
  endDate?: string;
  description?: Localizable;
}

export interface MemberType {

  id: string;
  uri: string;
  url: string;
  memberValues?: MemberValueType[];
  prefLabel?: Localizable;
  order?: string;
  created?: string;
  modified?: string;
  extension: ExtensionType;
  relatedMember?: MemberSimpleType;
  code: CodeType;
  startDate?: string;
  endDate?: string;
}

export interface MemberSimpleType {

  id: string;
  uri: string;
  url: string;
  memberValues?: MemberValueType[];
  prefLabel?: Localizable;
  order?: string;
  created?: string;
  modified?: string;
  code?: CodePlainWithCodeSchemeType;
  relatedMember?: MemberSimpleType;
  startDate?: string;
  endDate?: string;
}

export interface UserSimpleType {

  id: string;
  firstName: string;
  lastName: string;
}

export interface CodeSchemeListItemType {
  id: string;
  prefLabel: Localizable;
  codeValue: string;
  uri: string;
  startDate?: string;
  endDate?: string;
  status: string;
}

export interface ValueTypeType {

  id: string;
  prefLabel: Localizable;
  localName: string;
  typeUri: string;
  required: boolean;
  regexp: string;
  uri: string;
}

export interface MemberValueType {

  id?: string;
  value: string;
  valueType: ValueTypeType;
  created?: string;
  modified?: string;
}

export interface SearchHitType {

  type: string;
  prefLabel: Localizable;
  uri: string;
  entityCodeValue: string;
  codeSchemeCodeValue: string;
  codeRegistryCodeValue: string;
}

export interface DeepSearchHitListCodeType {
  type: 'CODE';
  totalHitCount: number;
  topHits: CodePlainType[];
}

export interface MessagingUserType {
  id: string;
  subscriptionType: string;
  resources?: MessagingResourceType[];
}

export interface MessagingResourceType {
  uri: string;
  application: string;
  type: string;
  prefLabel: Localizable;
}
