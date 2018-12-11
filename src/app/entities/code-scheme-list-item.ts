import { Localizable, Localizer } from 'yti-common-ui/types/localization';
import {CodeSchemeListItemType} from '../services/api-schema';
import {Moment} from 'moment';
import {parseDate, formatDisplayDateRange, formatDate} from '../utils/date';

export class CodeSchemeListItem {
  id: string;
  prefLabel: Localizable;
  codeValue: string;
  uri: string;
  startDate: Moment|null = null;
  endDate: Moment|null = null;
  status: string;

  constructor(data: CodeSchemeListItemType|null) {
    if (data) {
      this.id = data.id;
      this.prefLabel = data.prefLabel;
      this.codeValue = data.codeValue;
      this.uri = data.uri;
      if (data.startDate) {
        try {
          this.startDate = parseDate(data.startDate);
        } catch (e) {
          console.log('Error in parsing startDate but this can be ignored when cloning.'); // TODO FIX THIS HACK!
        }

      }
      if (data.endDate) {
        try {
          this.endDate = parseDate(data.endDate);
        } catch (e) {
          console.log('Error in parsing startDate but this can be ignored when cloning.'); // TODO FIX THIS HACK!
        }

      }
      this.status = data.status;
    }
  }

  get validityDateRange() {
    return formatDisplayDateRange(this.startDate, this.endDate);
  }

  getDisplayName(localizer: Localizer, useUILanguage: boolean = false): string {
    const displayName = localizer.translate(this.prefLabel, useUILanguage);
    return displayName ? displayName : this.codeValue;
  }

  serialize(): CodeSchemeListItemType {
    return {
      id: this.id,
      prefLabel: this.prefLabel,
      codeValue: this.codeValue,
      uri: this.uri,
      startDate: formatDate(this.startDate),
      endDate: formatDate(this.endDate),
      status: this.status
    };
  }
}
