
// TODO user proper date library such as https://js-joda.github.io/js-joda/
export const formatDate = (dateString: string) => dateString ? new Date(dateString).toLocaleString('fi') : '';

export function formatMoment(dateString: string): string {

  const moment = require('moment');
  return dateString ? `${moment(dateString).format('DD.MM.YYYY')}` : '';
}
