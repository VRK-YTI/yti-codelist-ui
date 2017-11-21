import { Localizable } from './localization';
import { PropertyType } from './property-type';

export class ExternalReference {

  id: string;
  uri: string;
  url: string;
  titles?: Localizable;
  descriptions?: Localizable;
  propertyType: PropertyType;
}
