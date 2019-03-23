import { Localizable } from 'yti-common-ui/types/localization';
import { SearchHitType } from '../services/api-schema';

export class SearchHit {

  type: string;
  prefLabel: Localizable = {};
  uri: string;
  entityCodeValue: string;
  codeSchemeCodeValue: string;
  codeRegistryCodeValue: string;

  constructor(data: SearchHitType) {
    this.type = data.type;
    this.prefLabel = data.prefLabel || {};
    this.uri = data.uri;
    this.entityCodeValue = data.entityCodeValue; // Code, Extension etc. codeValue
    this.codeSchemeCodeValue = data.codeSchemeCodeValue;
    this.codeRegistryCodeValue = data.codeRegistryCodeValue;
  }

  get idIdentifier(): string {
    return `${this.uri}`;
  }

  serialize(): SearchHitType {
    return {
      type: this.type,
      prefLabel: { ...this.prefLabel },
      uri: this.uri,
      entityCodeValue: this.entityCodeValue,
      codeSchemeCodeValue: this.codeSchemeCodeValue,
      codeRegistryCodeValue: this.codeRegistryCodeValue
    };
  }

  clone(): SearchHit {
    return new SearchHit(this.serialize());
  }
}
