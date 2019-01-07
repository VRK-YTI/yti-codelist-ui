import { Localizable, Localizer } from 'yti-common-ui/types/localization';
import { labelNameToResourceIdIdentifier } from 'yti-common-ui/utils/resource';
import { VocabularyType } from '../services/api-schema';

export class Vocabulary {

  id: string;
  prefLabel: Localizable;
  status: string;

  constructor(data: VocabularyType) {
    this.id = data.id;
    this.prefLabel = data.prefLabel;
    this.status = data.status;
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
