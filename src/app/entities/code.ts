import { Localizable } from './localization';
import { AbstractResource } from './abstract-resource';
import { CodeScheme } from './code-scheme';

export class Code extends AbstractResource {

  codeScheme: CodeScheme;
  shortName: string;
  status: string;
  startDate: string;
  endDate: string;
  descriptions: Localizable;
  definitions: Localizable;

  get registryCode() {
    return this.codeScheme.codeRegistry.codeValue;
  }

  get schemeCode() {
    return this.codeScheme.codeValue;
  }
}
