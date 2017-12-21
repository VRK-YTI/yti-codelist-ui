import { AbstractResource } from './abstract-resource';
import { Localizable } from 'yti-common-ui/types/localization';
import { Location } from 'yti-common-ui/types/location';
import { CodeRegistry } from './code-registry';
import { formatDate, formatMoment } from '../utils/date';
import { ExternalReference } from './external-reference';
import { EditableEntity } from './editable-entity';
import { Code } from './code';

export class CodeScheme extends AbstractResource implements EditableEntity {

  version: string;
  source: string;
  status: string;
  legalBase: string;
  governancePolicy: string;
  license: string;
  startDate: string;
  endDate: string;
  codeRegistry: CodeRegistry;
  description: Localizable;
  changeNote: Localizable;
  definition: Localizable;
  dataClassifications: Code[];
  externalReferences: ExternalReference[];

  get validity(): string {
    return `${formatMoment(this.startDate)} - ${formatMoment(this.endDate)}`;
  }

  get modifiedDisplayValue(): string {
    return formatDate(this.modified);
  }

  get route(): any[] {
    return [
      'codescheme',
      {
        codeRegistryCodeValue: this.codeRegistry.codeValue,
        codeSchemeId: this.id
      }
    ];
  }

  get location(): Location[] {
    return [{
      localizationKey: 'Code scheme',
      label: this.prefLabel,
      route: this.route
    }];
  }

  getOwningOrganizationIds(): string[] {
    return this.codeRegistry.organizations.map(org => org.id);
  }
}
