import { Localizable } from '../entities/localization';

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

export interface DataClassificationType  {

  codeValue: string;
  prefLabels: Localizable;
  codeScheme: { uri: string };
  count: number;
}
