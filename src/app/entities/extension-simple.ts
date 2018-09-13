import { Localizable, Localizer } from 'yti-common-ui/types/localization';
import { formatDate, formatDateTime, formatDisplayDateTime, parseDate, parseDateTime } from '../utils/date';
import { Moment } from 'moment';
import { ExtensionSimpleType } from '../services/api-schema';
import { hasLocalization } from 'yti-common-ui/utils/localization';
import { TranslateService } from '@ngx-translate/core';
import { CodePlain } from './code-simple';

export class ExtensionSimple {

  id: string;
  url: string;
  extensionValue: string;
  order?: string;
  modified: Moment | null = null;
  code: CodePlain;
  extension?: ExtensionSimple;
  prefLabel: Localizable;
  startDate: Moment | null = null;
  endDate: Moment | null = null;

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
    if (data.extension) {
      this.extension = new ExtensionSimple(data.extension);
    }
    if (data.startDate) {
      this.startDate = parseDate(data.startDate);
    }
    if (data.endDate) {
      this.endDate = parseDate(data.endDate);
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
      extension: this.extension ? this.extension.serialize() : undefined,
      startDate: formatDate(this.startDate),
      endDate: formatDate(this.endDate)
    };
  }

  getDisplayName(localizer: Localizer, translater: TranslateService, useUILanguage: boolean = false): string {
    const extensionTitle = localizer.translate(this.prefLabel, useUILanguage);

    let codeTitle = this.code ? localizer.translate(this.code.prefLabel, useUILanguage) : null;
    if (!codeTitle) {
      codeTitle = this.code ? this.code.codeValue : null;
    }
    const extensionValue = this.extensionValue;

    if (extensionTitle && extensionValue) {
      return `${extensionValue} ${extensionTitle} - ${codeTitle}`;
    } else if (extensionValue) {
      return `${extensionValue} - ${codeTitle}`;
    } else if (extensionTitle) {
      return `${extensionTitle} - ${codeTitle}`;
    } else {
      return codeTitle ? codeTitle : '';
    }
  }

  hasPrefLabel() {
    return hasLocalization(this.code.prefLabel);
  }

  clone(): ExtensionSimple {
    return new ExtensionSimple(this.serialize());
  }
}
