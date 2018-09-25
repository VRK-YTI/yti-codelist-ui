import { Localizable } from 'yti-common-ui/types/localization';
import { PropertyTypeType } from '../services/api-schema';
import { ValueType } from './value-type';

export class PropertyType {

  id: string;
  prefLabel: Localizable = {};
  definition: Localizable = {};
  localName: string;
  url: string;
  propertyUri: string;
  context: string;
  externaluri: string;
  valueTypes: ValueType[] = [];

  constructor(data: PropertyTypeType) {
    this.id = data.id;
    this.prefLabel = data.prefLabel || {};
    this.definition = data.definition || {};
    this.url = data.url;
    this.propertyUri = data.propertyUri;
    this.context = data.context;
    this.localName = data.localName;
    if (data.valueTypes) {
      this.valueTypes = (data.valueTypes || []).map(vt => new ValueType(vt));
    }
  }

  get idIdentifier(): string {
    return `${this.context}_${this.localName}`;
  }

  valueTypeForLocalName(localName: string): ValueType | null {
    const filteredValueTypes: ValueType[] = this.valueTypes.filter(valueType => valueType.localName === localName);
    if (filteredValueTypes) {
      return filteredValueTypes[0];
    }
    return null;
  }

  serialize(): PropertyTypeType {
    return {
      id: this.id,
      prefLabel: { ...this.prefLabel },
      definition: { ...this.definition },
      localName: this.localName,
      url: this.url,
      propertyUri: this.propertyUri,
      context: this.context,
      externaluri: this.externaluri,
      valueTypes: this.valueTypes.map(vt => vt.serialize())
    };
  }

  clone() {
    return new PropertyType(this.serialize());
  }
}
