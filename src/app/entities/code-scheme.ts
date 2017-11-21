import { AbstractResource } from './abstract-resource';
import { Localizable } from './localization';
import { Location } from './location';
import { CodeRegistry } from './code-registry';
import { formatDate } from '../utils/date';
import { ExternalReference } from './external-reference';

export class CodeScheme extends AbstractResource {

  version: string;
  source: string;
  status: string;
  legalBase: string;
  governancePolicy: string;
  license: string;
  startDate: string;
  endDate: string;
  codeRegistry: CodeRegistry;
  descriptions: Localizable;
  changeNotes: Localizable;
  definitions: Localizable;
  dataClassifications: { uri: string }[];
  externalReferences?: ExternalReference[];

  get validity(): string {
    return `${formatDate(this.startDate)} - ${formatDate(this.endDate)}`;
  }

  get modifiedDisplayValue(): string {
    return formatDate(this.modified);
  }

  get route(): any[] {
    return [
      'codescheme',
      {
        codeRegistryCodeValue: this.codeRegistry.codeValue,
        codeSchemeCodeValue: this.codeValue
      }
    ];
  }

  get location(): Location[] {
    return [{
      localizationKey: 'Code scheme',
      label: this.prefLabels,
      route: this.route
    }];
  }
}
