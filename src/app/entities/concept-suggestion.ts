import { Localizable, Localizer } from 'yti-common-ui/types/localization';
import { ConceptSuggestionType } from '../services/api-schema';
import { labelNameToResourceIdIdentifier } from 'yti-common-ui/utils/resource';

export class ConceptSuggestion {

  prefLabel: Localizable;
  definition: Localizable;
  creator?: string;
  vocabulary: string; // UUID
  uri?: string;

  constructor(data: ConceptSuggestionType) {
    this.prefLabel = data.prefLabel;
    this.definition = data.definition;
    this.creator = data.creator;
    this.vocabulary = data.vocabulary;
    this.uri = data.uri;
  }

  getIdIdentifier(localizer: Localizer): string {
    const vocabularyId = this.vocabulary;
    const prefLabel = localizer.translate(this.prefLabel);
    return `${labelNameToResourceIdIdentifier(vocabularyId)}_${labelNameToResourceIdIdentifier(prefLabel)}`;
  }

  getDisplayName(localizer: Localizer, useUILanguage: boolean = false): string {
    const displayName = localizer.translate(this.prefLabel, useUILanguage);
    return displayName ? displayName : 'no_name_found';
  }

  getDisplayDefintion(localizer: Localizer, useUILanguage: boolean = false): string {
    const displayDefinition = localizer.translate(this.definition, useUILanguage);
    return displayDefinition ? displayDefinition : 'no_name_found';
  }

  serialize(): ConceptSuggestionType {
    return {
      prefLabel: this.prefLabel,
      definition: this.definition,
      creator: this.creator,
      vocabulary: this.vocabulary,
      uri: this.uri
    };
  }
}
