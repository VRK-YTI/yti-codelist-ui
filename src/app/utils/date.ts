import * as moment from 'moment';
import { Moment } from 'moment';

function assertValid(moment: Moment): Moment {
  if (moment.isValid()) {
    return moment;
  } else {
    console.log(moment);
    throw new Error('Not a valid moment object');
  }
}

const dateFormat = 'YYYY-MM-DD';
const dateTimeFormat = 'YYYY-MM-DDTHH:mm:ss.SSSZZ';
const displayDateFormat = 'DD.MM.YYYY';
const displayDateTimeFormat = 'DD.MM.YYYY HH:mm';

export function parseDateTime(dateTime: string): Moment {
  return assertValid(moment(dateTime, dateTimeFormat));
}

export function formatDateTime(dateTime: Moment|null): string {
  return dateTime ? dateTime.format(dateTimeFormat) : '';
}

export function parseDate(dateStr: string): Moment {
  return assertValid(moment(dateStr, dateFormat));
}

export function formatDate(date: Moment|null): string {
  return date ? date.format(dateFormat) : '';
}

export function formatDisplayDate(date: Moment|null): string {
  return date ? date.format(displayDateFormat) : '';
}

export function formatDisplayDateTime(dateTime: Moment|null): string {
  return dateTime ? dateTime.format(displayDateTimeFormat) : '';
}

export interface PickerDate {
  year: number;
  month: number;
  day: number;
}

export function toPickerDate(date: Moment|null): PickerDate|null {

  if (!date) {
    return null;
  }

  return {
    year: date.year(),
    month: date.month() + 1,
    day: date.date()
  };
}

export function fromPickerDate(date: PickerDate|null): Moment|null {

  if (date == null) {
    return null;
  }

  return parseDate(`${date.year}-${date.month}-${date.day}`);
}
