import { Localizable } from '../entities/localization';
import { CodeScheme } from '../entities/code-scheme';

export interface ApiResponseType {

  meta: {
    message: string,
    code: number
  };
}

export interface BaseResourceType {

  id: string;
  uri: string;
  codeValue: string;
  modified: string;
  prefLabels?: Localizable;
}

export interface CodeRegistryType extends BaseResourceType {
  codeSchemes?: { uri: string };
}

export interface CodeSchemeType extends BaseResourceType {

  version: string;
  source: string;
  status: string;
  legalBase: string;
  governancePolicy: string;
  license: string;
  startDate: string;
  endDate: string;
  codeRegistry: CodeRegistryType;
  descriptions?: Localizable;
  changeNotes?: Localizable;
  definitions?: Localizable;
  dataClassifications: { uri: string }[];
  externalReferences?: ExternalReferenceType[];
}

export interface CodeType extends BaseResourceType {

  codeScheme: CodeSchemeType;
  shortName: string;
  status: string;
  startDate: string;
  endDate: string;
  descriptions?: Localizable;
  definitions?: Localizable;
}

export interface ExternalReferenceType  {

  id: string;
  uri: string;
  url: string;
  titles?: Localizable;
  descriptions?: Localizable;
  propertyType: PropertyTypeType;
}

export interface PropertyTypeType  {

  id: string;
  prefLabels: Localizable;
  definitions: Localizable;
  localName: string;
  uri: string;
  propertyUri: string;
  context: string;
  externaluri: string;
  type: string;
}

export interface DataClassificationType  {

  codeValue: string;
  prefLabels: Localizable;
  codeScheme: { uri: string };
  count: number;
}
