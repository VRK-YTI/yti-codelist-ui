import { Localizable } from 'yti-common-ui/types/localization';
import { PropertyTypeType } from '../services/api-schema';

export class PropertyType {

  id: string;
  prefLabel: Localizable = {};
  definition: Localizable = {};
  localName: string;
  uri: string;
  url: string;
  propertyUri: string;
  context: string;
  externaluri: string;
  type: string;


  constructor(data: PropertyTypeType) {
    this.id = data.id;
    this.prefLabel = data.prefLabel || {};
    this.definition = data.definition || {};
    this.uri = data.uri;
    this.url = data.url;
    this.propertyUri = data.propertyUri;
    this.context = data.context;
    this.localName = data.localName;
    this.type = data.type;
  }

  serialize(): PropertyTypeType {
    return {
      id: this.id,
      prefLabel: { ...this.prefLabel },
      definition: { ...this.definition },
      localName: this.localName,
      uri: this.uri,
      url: this.url,
      propertyUri: this.propertyUri,
      context: this.context,
      externaluri: this.externaluri,
      type: this.type
    };
  }

  clone() {
    return new PropertyType(this.serialize());
  }
}
