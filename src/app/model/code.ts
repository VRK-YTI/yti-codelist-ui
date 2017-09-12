import { BaseResource } from './baseresource';
import { CodeScheme } from './codescheme';

export interface Code extends BaseResource {

  definition: string;
  codeScheme: CodeScheme;
  shortName: string;
  status: string;
  startDate: string;
  endDate: string;

}
