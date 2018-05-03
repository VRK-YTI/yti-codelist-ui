import { Localizable } from 'yti-common-ui/types/localization';
import { ConceptType } from '../services/api-schema';
import { AbstractResource } from './abstract-resource';
import { formatDateTime, parseDateTime } from '../utils/date';
import { Moment } from 'moment';

export class Concept extends AbstractResource {

  vocabularyId: string;
  definition: Localizable;
  vocabularyPrefLabel: Localizable;
  modified: Moment|null = null;

  constructor(data: ConceptType) {
    super(data);
    if (data.modified) {
      this.modified = parseDateTime(data.modified);
    }
    this.vocabularyId = data.vocabularyId;
    this.definition = data.definition;
    this.vocabularyPrefLabel = data.vocabularyPrefLabel;
  }

  serialize(): ConceptType {
    return {
      id: this.id,
      vocabularyId: this.vocabularyId,
      prefLabel: this.prefLabel,
      vocabularyPrefLabel: this.vocabularyPrefLabel,
      definition: this.definition,
      uri: this.uri,
      url: this.url,
      codeValue: this.codeValue,
      modified: formatDateTime(this.modified)
    };
  }
}
