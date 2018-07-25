import {Localizable} from 'yti-common-ui/types/localization';
import {CodeSchemeListItemType} from '../services/api-schema';

export class CodeSchemeListItem {
  prefLabel: Localizable;
  uri: string;

  constructor(data: CodeSchemeListItemType|null) {
    if (data) {
      this.prefLabel = data.prefLabel;
      this.uri = data.uri;
    }
  }
}
