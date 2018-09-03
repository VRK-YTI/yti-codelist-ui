import { Localizable, Localizer } from 'yti-common-ui/types/localization';
import { formatDateTime, formatDisplayDateTime, parseDateTime } from '../utils/date';
import { Moment } from 'moment';
import { ExtensionSimpleType } from '../services/api-schema';
import { hasLocalization } from 'yti-common-ui/utils/localization';
import { TranslateService } from 'ng2-translate';
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
