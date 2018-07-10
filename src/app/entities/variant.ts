import {Localizable, Localizer} from 'yti-common-ui/types/localization';
import {VariantType} from '../services/api-schema';

export class Variant {
  prefLabel: Localizable;
  uri: string;

  constructor(data: VariantType|null) {
    if (data) {
      this.prefLabel = data.prefLabel;
      this.uri = data.uri;
    }
  }
}
