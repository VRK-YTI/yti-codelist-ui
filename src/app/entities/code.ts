import { Localizable } from 'yti-common-ui/types/localization';
import { Location } from 'yti-common-ui/types/location';
import { AbstractResource } from './abstract-resource';
import { CodeScheme } from './code-scheme';
import { formatDate } from '../utils/date';

export class Code extends AbstractResource {

  codeScheme: CodeScheme;
  shortName: string;
  status: string;
  startDate: string;
  endDate: string;
  description: Localizable;
  definition: Localizable;

  get registryCode() {
    return this.codeScheme.codeRegistry.codeValue;
  }

  get schemeId() {
    return this.codeScheme.id;
  }

  get validity(): string {
    return `${formatDate(this.startDate)} - ${formatDate(this.endDate)}`;
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
}
