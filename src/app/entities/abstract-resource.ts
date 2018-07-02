import { Localizable, Localizer } from 'yti-common-ui/types/localization';
import { Moment } from 'moment';
import { BaseResourceType } from '../services/api-schema';
import { parseDateTime } from '../utils/date';
import { hasLocalization } from 'yti-common-ui/utils/localization';

export abstract class AbstractResource {

  id: string;
  uri: string;
  url: string;
  codeValue: string;
  prefLabel: Localizable;

  constructor(data: BaseResourceType) {
    this.id = data.id;
    this.uri = data.uri;
    this.url = data.url;
    this.codeValue = data.codeValue;
    this.prefLabel = data.prefLabel || {};
  }

  getDisplayName(localizer: Localizer, useUILanguage: boolean = false): string {
    const displayName = localizer.translate(this.prefLabel, useUILanguage);
    return displayName ? displayName : this.codeValue;
  }

  getLongDisplayName(localizer: Localizer, useUILanguage: boolean = false): string {
    const displayName = localizer.translate(this.prefLabel, useUILanguage);
    return displayName ? this.codeValue + ' - ' + displayName : this.codeValue;
  }

  hasPrefLabel() {
    return hasLocalization(this.prefLabel);
  }
}
