import { BaseResource } from './baseresource';
import { CodeRegistry } from './coderegistry';

export interface CodeScheme extends BaseResource {

  version: string;
  source: CodeScheme;
  changeNote: string;
  description: string;
  definition: string;
  status: string;
  startDate: string;
  endDate: string;
  codeRegistry: CodeRegistry;

}
