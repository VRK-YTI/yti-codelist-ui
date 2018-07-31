import {Localizable} from 'yti-common-ui/types/localization';
import {CodeSchemeListItemType} from '../services/api-schema';
import {Moment} from 'moment';
import {parseDate, formatDisplayDateRange} from '../utils/date';

export class CodeSchemeListItem {
  prefLabel: Localizable;
  uri: string;
  startDate: Moment|null = null;
  endDate: Moment|null = null;
  status: string;

  constructor(data: CodeSchemeListItemType|null) {
    if (data) {
      this.prefLabel = data.prefLabel;
      this.uri = data.uri;
      if (data.startDate) {
        try {
          this.startDate = parseDate(data.startDate);
        } catch (e) {
          console.log('Rrror in parsing startDate but this can be ignored when cloning.'); // TODO FIX THIS HACK!
        }

      }
      if (data.endDate) {
        try {
          this.endDate = parseDate(data.endDate);
        } catch (e) {
          console.log('Rrror in parsing startDate but this can be ignored when cloning.'); // TODO FIX THIS HACK!
        }

      }
      this.status = data.status;
    }
  }

  get validityDateRange() {
    return formatDisplayDateRange(this.startDate, this.endDate);
  }
}
