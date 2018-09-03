import { Localizable, Localizer } from 'yti-common-ui/types/localization';
import { formatDate, formatDateTime, formatDisplayDateTime, parseDate, parseDateTime } from '../utils/date';
import { Moment } from 'moment';
import { ExtensionSimpleType } from '../services/api-schema';
import { hasLocalization } from 'yti-common-ui/utils/localization';
import { TranslateService } from '@ngx-translate/core';
import { Code } from './code';
import { ExtensionScheme } from './extension-scheme';

export class ExtensionSimple {

  id: string;
  url: string;
  extensionValue: string;
  order?: string;
  modified: Moment | null = null;
  code: Code;
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
      this.code = new Code(data.code);
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
    const codeLabel = translater.instant('code');
    const valueLabel = translater.instant('value');

    if (extensionTitle) {
      return `${extensionTitle} - ${codeLabel}: ${codeTitle} - ${valueLabel}: ${extensionValue}`;
    } else {
      return `${codeLabel}: ${codeTitle} - ${valueLabel}: ${extensionValue}`;
    }
  }

  getDisplayNameWithExtensionScheme(extensionScheme: ExtensionScheme,
                                    localizer: Localizer,
                                    translater: TranslateService,
                                    useUILanguage: boolean = false): string {
    const extensionTitle = localizer.translate(this.prefLabel, useUILanguage);

    let codeTitle = this.code ? localizer.translate(this.code.prefLabel, useUILanguage) : null;
    if (!codeTitle) {
      codeTitle = this.code ? this.code.codeValue : null;
    }
    if (this.code.codeScheme.id !== extensionScheme.parentCodeScheme.id) {
      const codeSchemeTitle = localizer.translate(this.code.codeScheme.prefLabel, useUILanguage);
      codeTitle = codeTitle + ' - ' + codeSchemeTitle;
    }

    const extensionValue = this.extensionValue;

    if (extensionTitle && extensionValue) {
      return `${extensionValue} ${extensionTitle} - ${codeTitle}`;
    } else if (extensionValue) {
      return `${extensionValue} - ${codeTitle}`;
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
