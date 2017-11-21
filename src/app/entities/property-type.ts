import { Localizable } from './localization';

export class PropertyType {

  id: string;
  uri: string;
  propertyUri: string;
  context: string;
  localName: string;
  type: string;
  prefLabels: Localizable;
  definitions: Localizable;
}
