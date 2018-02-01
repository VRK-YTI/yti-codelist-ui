import { Localizable } from 'yti-common-ui/types/localization';
import { Location } from 'yti-common-ui/types/location';
import { AbstractResource } from './abstract-resource';
import { CodeScheme } from './code-scheme';
import { formatDate, formatMoment } from '../utils/date';
import { EditableEntity } from './editable-entity';
import { ExternalReference } from './external-reference';
import { Status } from 'yti-common-ui/entities/status';

export class Code extends AbstractResource implements EditableEntity {

  codeScheme: CodeScheme;
  shortName: string;
  status: Status;
  startDate: string;
  endDate: string;
  description: Localizable;
  definition: Localizable;
  externalReferences: ExternalReference[];

  get registryCode() {
    return this.codeScheme.codeRegistry.codeValue;
  }

  get schemeId() {
    return this.codeScheme.id;
  }

  get validity(): string {
    return `${formatMoment(this.startDate)} - ${formatMoment(this.endDate)}`;
  }

  get modifiedDisplayValue(): string {
    return formatDate(this.modified);
  }

  get route(): any[] {
    return [
      'code',
      {
        codeRegistryCodeValue: this.registryCode,
        codeSchemeId: this.schemeId,
        codeId: this.id
      }
    ];
  }

  get location(): Location[] {
    return [
      ...this.codeScheme.location,
      {
        localizationKey: 'Code',
        label: this.prefLabel,
        route: this.route
      }
    ];
  }

  getOwningOrganizationIds(): string[] {
    return this.codeScheme.codeRegistry.organizations.map(org => org.id);
  }
}
