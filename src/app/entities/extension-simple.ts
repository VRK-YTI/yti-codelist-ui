import { Localizable, Localizer } from 'yti-common-ui/types/localization';
import { formatDateTime, formatDisplayDateTime, parseDateTime } from '../utils/date';
import { Moment } from 'moment';
import { ExtensionSimpleType, ExtensionType } from '../services/api-schema';
import { hasLocalization } from 'yti-common-ui/utils/localization';
import { CodePlain } from './code-simple';
import { TranslateService } from 'ng2-translate';

export class ExtensionSimple {

  id: string;
  url: string;
  extensionValue: string;
  order?: string;
  modified: Moment|null = null;
  code: CodePlain;
  prefLabel: Localizable;

  constructor(data: ExtensionSimpleType) {
    this.id = data.id;
    this.url = data.url;
    this.order = data.order;
    this.extensionValue = data.extensionValue;
    this.prefLabel = data.prefLabel || {};
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
      extensionValue: this.extensionValue,
      prefLabel: { ...this.prefLabel },
      modified: formatDateTime(this.modified),
      order: this.order,
      code: this.code.serialize(),
    };
  }

  getDisplayName(localizer: Localizer, translater: TranslateService, useUILanguage: boolean = false): string {
    const extensionTitle = localizer.translate(this.prefLabel, useUILanguage);
    let codeTitle = this.code ? localizer.translate(this.code.prefLabel, useUILanguage) : null;
    if (!codeTitle) {
      codeTitle = this.code ? this.code.codeValue : null;
    }
    const extensionValue = this.extensionValue;
    const codeLabel = translater.instant('code');
    const valueLabel = translater.instant('value');

    if (extensionTitle) {
      return `${extensionTitle} - ${codeLabel}: ${codeTitle} - ${valueLabel}: ${extensionValue}`;
    } else {
      return `${codeLabel}: ${codeTitle} - ${valueLabel}: ${extensionValue}`;
    }
  }

  hasPrefLabel() {
    return hasLocalization(this.code.prefLabel);
  }

  clone(): ExtensionSimple {
    return new ExtensionSimple(this.serialize());
  }
}
