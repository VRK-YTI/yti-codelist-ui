
// TODO user proper date library such as https://js-joda.github.io/js-joda/
export const formatDate = (dateString: string) => dateString ? new Date(dateString).toLocaleString('fi') : '';
