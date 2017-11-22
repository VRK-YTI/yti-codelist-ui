import { Localizable } from './localization';
import { PropertyType } from './property-type';

export class ExternalReference {

  id = '';
  uri = '';
  url = '';
  titles: Localizable = {};
  descriptions: Localizable = {};
  propertyType: PropertyType;
}
