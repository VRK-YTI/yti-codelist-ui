import { BaseResource } from './baseresource';
import { CodeRegistry } from './coderegistry';

export interface CodeScheme extends BaseResource {

  version: string;
  source: string;
  status: string;
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
