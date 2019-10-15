import { Localizable, Localizer } from 'yti-common-ui/types/localization';
import { labelNameToResourceIdIdentifier } from 'yti-common-ui/utils/resource';
import { VocabularyType } from '../services/api-schema';
import { Code } from './code';

export class Vocabulary {

  uri: string;
  description: Localizable;
  prefLabel: Localizable;
  status: string;
  languages: string[];
  languageCodes: Code[];

  constructor(data: VocabularyType) {
    this.uri = data.uri;
    this.prefLabel = data.prefLabel;
    this.status = data.status;
    this.description = data.description;
    this.languages = data.languages;
  }

  getDisplayName(localizer: Localizer, useUILanguage: boolean = false): string {
    const displayName = localizer.translate(this.prefLabel, useUILanguage);
    return displayName ? displayName : 'no_name_found';
  }

  getIdIdentifier(localizer: Localizer, useUILanguage: boolean = false): string {
    const prefLabel = localizer.translate(this.prefLabel, useUILanguage);
    return labelNameToResourceIdIdentifier(prefLabel);
  }
}
