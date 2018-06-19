import { Localizer } from 'yti-common-ui/types/localization';
import { Location } from 'yti-common-ui/types/location';
import { formatDateTime, formatDisplayDateTime, parseDateTime } from '../utils/date';
import { EditableEntity } from './editable-entity';
import { Moment } from 'moment';
import { ExtensionType } from '../services/api-schema';
import { hasLocalization } from 'yti-common-ui/utils/localization';
import { ExtensionScheme } from './extension-scheme';
import { CodePlain } from './code-simple';

export class Extension implements EditableEntity {

  id: string;
  url: string;
  extensionValue: string;
  order?: string;
  modified: Moment|null = null;
  extensionScheme: ExtensionScheme;
  extension?: Extension;
  code: CodePlain;

  constructor(data: ExtensionType) {
    this.id = data.id;
    this.url = data.url;
    this.order = data.order;
    this.extensionValue = data.extensionValue;
    if (data.modified) {
      this.modified = parseDateTime(data.modified);
    }
    this.extensionScheme = new ExtensionScheme(data.extensionScheme);
    if (data.extension) {
      this.extension = new Extension(data.extension);
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
    return [{
      localizationKey: 'Extension',
      label: this.code.prefLabel,
      value: !hasLocalization(this.code.prefLabel) ? this.code.codeValue : '',
      route: this.route
    }];
  }

  getOwningOrganizationIds(): string[] {
    return this.extensionScheme.parentCodeScheme.codeRegistry.organizations.map(org => org.id);
  }

  serialize(): ExtensionType {
    return {
      id: this.id,
      url: this.url,
      modified: formatDateTime(this.modified),
      extensionValue: this.extensionValue,
      order: this.order,
      extensionScheme: this.extensionScheme.serialize(),
      extension: this.extension ? this.extension.serialize() : undefined,
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

  clone(): Extension {
    return new Extension(this.serialize());
  }
}
