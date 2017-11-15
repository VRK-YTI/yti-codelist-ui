import { Localizable } from './localization';

export interface Location {
  localizationKey?: string;
  label?: Localizable;
  route?: any[];
}
