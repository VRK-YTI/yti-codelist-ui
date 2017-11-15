import { AbstractResource } from './abstract-resource';
import { Localizable } from './localization';
import { Location } from './location';
import { CodeRegistry } from './code-registry';

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
