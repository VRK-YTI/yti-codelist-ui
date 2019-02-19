import { Localizable } from 'yti-common-ui/types/localization';
import { SearchHitType } from '../services/api-schema';

export class SearchHit {

  type: string;
  prefLabel: Localizable = {};
  uri: string;

  constructor(data: SearchHitType) {
    this.type = data.type;
    this.prefLabel = data.prefLabel || {};
    this.uri = data.uri;
  }

  get idIdentifier(): string {
    return `${this.uri}`;
  }

  serialize(): SearchHitType {
    return {
      type: this.type,
      prefLabel: { ...this.prefLabel },
      uri: this.uri
    };
  }

  clone(): SearchHit {
    return new SearchHit(this.serialize());
  }
}
