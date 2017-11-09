import { BaseResource } from './baseresource';
import { CodeRegistry } from './coderegistry';
import { Code } from './code';

export interface CodeScheme extends BaseResource {

  version: string;
  source: string;
  status: string;
  legalBase: string;
  governancePolicy: string;
  license: string;
  startDate: string;
  endDate: string;
  codeRegistry: CodeRegistry;
  descriptions: {
    fi: string,
    en: string,
    sv: string
  };
  changeNotes: {
    fi: string,
    en: string,
    sv: string
  };
}
