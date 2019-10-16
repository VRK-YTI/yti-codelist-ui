import { Localizable, Localizer } from 'yti-common-ui/types/localization';
import { ConceptType } from '../services/api-schema';
import { labelNameToResourceIdIdentifier } from 'yti-common-ui/utils/resource';

export class Concept {

  id: string;
  uri: string;
  containerUri: string;
  definition: Localizable;
  prefLabel: Localizable;
  vocabularyPrefLabel: Localizable;
  status: string;

  constructor(data: ConceptType) {
    this.uri = data.uri;
    this.id = data.id;
    this.containerUri = data.container;
    this.definition = data.description; // this mismatch in naming is not a mistake. This is due to the integration APIs forcing all objects to have "description".
    this.prefLabel = data.prefLabel;
    this.vocabularyPrefLabel = data.vocabularyPrefLabel;
    this.status = data.status;
  }

  getIdIdentifier(localizer: Localizer): string {
    const vocabularyPrefLabel = localizer.translate(this.vocabularyPrefLabel);
    const prefLabel = localizer.translate(this.prefLabel);
    return `${labelNameToResourceIdIdentifier(vocabularyPrefLabel)}_${labelNameToResourceIdIdentifier(prefLabel)}`;
  }

  serialize(): ConceptType {
    return {
      id: this.id,
      container: this.containerUri,
      prefLabel: this.prefLabel,
      vocabularyPrefLabel: this.vocabularyPrefLabel,
      description: this.definition,
      uri: this.uri,
      status: this.status
    };
  }
}
