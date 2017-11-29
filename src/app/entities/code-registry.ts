import { AbstractResource } from './abstract-resource';
import { Organization } from './organization';

export class CodeRegistry extends AbstractResource {

  codeSchemes?: { uri: string };
  organizations: Organization[];
}
