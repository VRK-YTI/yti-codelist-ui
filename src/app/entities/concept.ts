import { Localizable, Localizer } from 'yti-common-ui/types/localization';
import { ConceptType } from '../services/api-schema';
import { labelNameToResourceIdIdentifier } from 'yti-common-ui/utils/resource';

export class Concept {

  id: string;
  uri: string;
  vocabularyId: string;
  definition: Localizable;
  prefLabel: Localizable;
  vocabularyPrefLabel: Localizable;

  constructor(data: ConceptType) {

    this.uri = data.uri;
    this.id = data.id;
    this.vocabularyId = data.vocabularyId;
    this.definition = data.definition;
    this.prefLabel = data.prefLabel;
    this.vocabularyPrefLabel = data.vocabularyPrefLabel;
  }

  getIdIdentifier(localizer: Localizer): string {
    const vocabularyPrefLabel = localizer.translate(this.vocabularyPrefLabel);
    const prefLabel = localizer.translate(this.prefLabel);
    return `${labelNameToResourceIdIdentifier(vocabularyPrefLabel)}_${labelNameToResourceIdIdentifier(prefLabel)}`;
  }

  serialize(): ConceptType {
    return {
      id: this.id,
      vocabularyId: this.vocabularyId,
      prefLabel: this.prefLabel,
      vocabularyPrefLabel: this.vocabularyPrefLabel,
      definition: this.definition,
      uri: this.uri
    };
  }
}
