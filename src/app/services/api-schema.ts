import { Localizable } from 'yti-common-ui/types/localization';
import { Status } from 'yti-common-ui/entities/status';

export interface ApiResponseType {

  meta: {
    message: string,
    code: number,
    entityIdentifier?: string
  };
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
  dataClassifications: CodePlainType[];
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
}

export interface CodePlainType extends BaseResourceType {

  status: Status;
  broaderCode?: CodePlainType;
  hierarchyLevel?: number;
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
}

export interface ConceptType {

  id: string;
  prefLabel: Localizable;
  definition: Localizable;
  vocabularyPrefLabel: Localizable;
  vocabularyId: string;
  uri: string;
}

export interface ConceptSuggestionType {

  prefLabel: Localizable;
  definition?: Localizable;
  creator?: string;
  vocabulary: string; // UUID
  uri?: string;
}

export interface VocabularyType {

  id: string;
  prefLabel: Localizable;
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

export interface DataClassificationType {

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
  parentCodeScheme: CodeSchemeType;
  codeSchemes?: CodeSchemeType[];
  description?: Localizable;
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
  code: CodePlainType;
  relatedMember?: MemberSimpleType;
  startDate?: string;
  endDate?: string;
}

export interface CodeSchemeListItemType {
  id: string;
  prefLabel: Localizable;
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
