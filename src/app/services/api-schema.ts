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
  externalReferences?: ExternalReferenceType[];
  extensionSchemes?: ExtensionSchemeSimpleType[];
  conceptUriInVocabularies: string;
  defaultCode?: CodePlainType;
}

export interface CodePlainType extends BaseResourceType {

  status: Status;
  broaderCodeId?: string;
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
  broaderCodeId?: string;
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

export interface VocabularyType {

  id: string;
  prefLabel: Localizable;
}


export interface ExternalReferenceType  {

  modified?: string;
  id: string;
  url: string;
  href: string;
  global: boolean;
  title?: Localizable;
  description?: Localizable;
  propertyType?: PropertyTypeType;
}

export interface PropertyTypeType  {

  id: string;
  prefLabel: Localizable;
  definition: Localizable;
  localName: string;
  url: string;
  propertyUri: string;
  context: string;
  externaluri: string;
  type: string;
}

export interface DataClassificationType  {

  id: string;
  uri: string;
  status: string;
  codeValue: string;
  prefLabel: Localizable;
  codeScheme: { uri: string };
  count: number;
}

export interface OrganizationType {

  id: string;
  prefLabel: Localizable;
  description: Localizable;
  url: string;
}

export interface ExtensionSchemeType {

  id: string;
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

export interface ExtensionSchemeSimpleType {

  id: string;
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

export interface ExtensionType {

  id: string;
  url: string;
  extensionValue: string;
  prefLabel?: Localizable;
  order?: string;
  modified?: string;
  extensionScheme: ExtensionSchemeType;
  extension?: ExtensionSimpleType;
  code: CodePlainType;
}

export interface ExtensionSimpleType {

  id: string;
  url: string;
  extensionValue: string;
  prefLabel?: Localizable;
  order?: string;
  modified?: string;
  code: CodePlainType;
}
