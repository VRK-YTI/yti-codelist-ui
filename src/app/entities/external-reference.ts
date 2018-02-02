import { Localizable } from 'yti-common-ui/types/localization';
import { PropertyType } from './property-type';

export const CCBy40LicenseLinkId = '9a25f7fc-e4be-11e7-82ab-479f4f288376';
export const CC0LicenseLinkId = '9553aad0-e4be-11e7-81e9-1faf2d228a02';

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

  titleHasValue() {
    return Object.entries(this.title).filter(([language, value]) => value !== '').length > 0;
  }

  get image(): any {
    switch (this.id) {
      case CCBy40LicenseLinkId: 
        return require('../../assets/images/ccby40-icon-88x31.png');
      case CC0LicenseLinkId: 
        return require('../../assets/images/cc0-icon-88x31.png');
      default:
        return null;
    }
  }
}
