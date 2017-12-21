import * as moment from 'moment';

// TODO user proper date library such as https://js-joda.github.io/js-joda/
export const formatDate = (dateString: string) => dateString ? new Date(dateString).toLocaleString('fi') : '';

export function formatMoment(dateString: string): string {

  const moment = require('moment');
  return dateString ? `${moment(dateString).format('DD.MM.YYYY')}` : '';
}

export interface PickerDate {
  year: number;
  month: number;
  day: number;
}

export function toPickerDate(dateStr: string) {

  if (!dateStr) {
    return null;
  }

  const date = moment(dateStr);

  return {
    year: date.year(),
    month: date.month() + 1,
    day: date.date()
  };
}

export function fromPickerDate(date: PickerDate|null): string {

  if (date == null) {
    return '';
  }

  return `${date.year}-${date.month}-${date.day}`;
}
