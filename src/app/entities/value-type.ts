import { Localizable } from 'yti-common-ui/types/localization';
import { ValueTypeType } from '../services/api-schema';

export class ValueType {

  id: string;
  prefLabel: Localizable = {};
  localName: string;
  typeUri: string;
  uri: string;
  required: boolean;
  regexp: string;

  constructor(data: ValueTypeType) {
    this.id = data.id;
    this.prefLabel = data.prefLabel || {};
    this.required = data.required;
    this.localName = data.localName;
    this.regexp = data.regexp;
  }

  get idIdentifier(): string {
    return `${this.localName}`;
  }

  serialize(): ValueTypeType {
    return {
      id: this.id,
      prefLabel: { ...this.prefLabel },
      localName: this.localName,
      typeUri: this.typeUri,
      required: this.required,
      regexp: this.regexp,
      uri: this.uri
    };
  }

  clone() {
    return new ValueType(this.serialize());
  }
}
