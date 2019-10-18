import { ConceptResponseType } from '../services/api-schema';
import { Concept } from './concept';
import { Meta } from './meta';

export class ConceptResponse {

  meta: Meta;
  concepts: Concept[];

  constructor(data: ConceptResponseType) {

    this.meta = new Meta(data.meta);
    this.concepts = (data.results || []).map(concept => new Concept(concept));
  }

  serialize(): ConceptResponseType {

    return {
      meta: this.meta.serialize(),
      results: this.concepts.map(concept => concept.serialize())
    };
  }

  clone(): ConceptResponse {

    return new ConceptResponse(this.serialize());
  }
}
