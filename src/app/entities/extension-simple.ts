import { Localizer } from 'yti-common-ui/types/localization';
import { formatDateTime, formatDisplayDateTime, parseDateTime } from '../utils/date';
import { Moment } from 'moment';
import { ExtensionSimpleType, ExtensionType } from '../services/api-schema';
import { hasLocalization } from 'yti-common-ui/utils/localization';
import { CodePlain } from './code-simple';

export class ExtensionSimple {

  id: string;
  url: string;
  extensionValue: string;
  order?: string;
  modified: Moment|null = null;
  code: CodePlain;

  constructor(data: ExtensionSimpleType) {
    this.id = data.id;
    this.url = data.url;
    this.order = data.order;
    this.extensionValue = data.extensionValue;
    if (data.modified) {
      this.modified = parseDateTime(data.modified);
    }
    if (data.code) {
      this.code = new CodePlain(data.code);
    }
  }

  get modifiedDisplayValue(): string {
    return formatDisplayDateTime(this.modified);
  }

  serialize(): ExtensionSimpleType {
    return {
      id: this.id,
      url: this.url,
      modified: formatDateTime(this.modified),
      extensionValue: this.extensionValue,
      order: this.order,
      code: this.code.serialize(),
    };
  }

  getDisplayName(localizer: Localizer, useUILanguage: boolean = false): string {
    const displayName = localizer.translate(this.code.prefLabel, useUILanguage);
    return displayName ? displayName : this.code.codeValue;
  }

  hasPrefLabel() {
    return hasLocalization(this.code.prefLabel);
  }

  clone(): ExtensionSimple {
    return new ExtensionSimple(this.serialize());
  }
}
