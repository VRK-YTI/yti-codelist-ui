import { Localizable } from 'yti-common-ui/types/localization';
import { PropertyType } from './property-type';

export class ExternalReference {

  id = '';
  uri = '';
  url = '';
  title: Localizable = {};
  global = false;
  description: Localizable = {};
  propertyType: PropertyType;

  clone() {
    return Object.assign(new ExternalReference(), this);
  }
}
