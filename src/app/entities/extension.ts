import { Localizable, Localizer } from 'yti-common-ui/types/localization';
import { Location } from 'yti-common-ui/types/location';
import { formatDateTime, formatDisplayDateTime, parseDateTime } from '../utils/date';
import { EditableEntity } from './editable-entity';
import { Moment } from 'moment';
import { ExtensionType } from '../services/api-schema';
import { hasLocalization } from 'yti-common-ui/utils/localization';
import { ExtensionScheme } from './extension-scheme';
import { CodePlain } from './code-simple';
import { ExtensionSimple } from './extension-simple';
import { TranslateService } from 'ng2-translate';

export class Extension implements EditableEntity {

  id: string;
  url: string;
  extensionValue: string;
  order?: string;
  modified: Moment|null = null;
  extensionScheme: ExtensionScheme;
  extension?: ExtensionSimple;
  code: CodePlain;
  prefLabel: Localizable;

  constructor(data: ExtensionType) {
    this.id = data.id;
    this.url = data.url;
    this.order = data.order;
    this.extensionValue = data.extensionValue;
    if (data.modified) {
      this.modified = parseDateTime(data.modified);
    }
    this.prefLabel = data.prefLabel || {};
    this.extensionScheme = new ExtensionScheme(data.extensionScheme);
    if (data.extension) {
      this.extension = new ExtensionSimple(data.extension);
    }
    if (data.code) {
      this.code = new CodePlain(data.code);
    }
  }

  get modifiedDisplayValue(): string {
    return formatDisplayDateTime(this.modified);
  }

  get route(): any[] {
    return [
      'extension',
      {
        registryCode: this.extensionScheme.parentCodeScheme.codeRegistry.codeValue,
        schemeCode: this.extensionScheme.parentCodeScheme.codeValue,
        extensionSchemeCode: this.extensionScheme.codeValue,
        extensionId: this.id
      }
    ];
  }

  get location(): Location[] {
    return [
    ...this.extensionScheme.location,
    {
      localizationKey: 'Extension',
      label: this.prefLabel,
      value: !hasLocalization(this.prefLabel) ? this.code.codeValue : '',
      route: this.route
    }];
  }

  getOwningOrganizationIds(): string[] {
    return this.extensionScheme.parentCodeScheme.codeRegistry.organizations.map(org => org.id);
  }

  allowOrganizationEdit(): boolean {
    return true;
  }

  serialize(): ExtensionType {
    return {
      id: this.id,
      url: this.url,
      prefLabel: { ...this.prefLabel },
      extensionValue: this.extensionValue,
      modified: formatDateTime(this.modified),
      order: this.order,
      extensionScheme: this.extensionScheme.serialize(),
      extension: this.extension ? this.extension.serialize() : undefined,
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

  clone(): Extension {
    return new Extension(this.serialize());
  }
}
