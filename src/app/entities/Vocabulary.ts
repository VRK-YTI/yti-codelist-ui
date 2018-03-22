import { Localizable, Localizer } from 'yti-common-ui/types/localization';

export class Vocabulary {

  id: string;
  prefLabel: Localizable;

  constructor(data: any) {
    this.id = data.id;
    this.prefLabel = data.prefLabel;
  }

  getDisplayName(localizer: Localizer, useUILanguage: boolean = false): string {
    const displayName = localizer.translate(this.prefLabel, useUILanguage);
    return displayName ? displayName : 'no_name_found';
  }

}
