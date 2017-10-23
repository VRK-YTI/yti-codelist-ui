import { BaseResource } from './baseresource';
import { CodeScheme } from './codescheme';

export interface Code extends BaseResource {

  codeScheme: CodeScheme;
  shortName: string;
  status: string;
  startDate: string;
  endDate: string;
  descriptions: {
    fi: string,
    en: string,
    sv: string
  };
}
