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
  dataClassifications: DataClassificationType[];
  externalReferences?: ExternalReferenceType[];
  conceptUriInVocabularies: string;
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
}

export interface ConceptType extends BaseResourceType {

  modified?: string;
  vocabularyId: string;
  definition: Localizable;
  vocabularyPrefLabel: Localizable;
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
