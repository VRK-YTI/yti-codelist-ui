import { Localizable } from 'yti-common-ui/types/localization';
import { Moment } from 'moment';
import { BaseResourceType } from '../services/api-schema';
import { parseDateTime } from '../utils/date';

export abstract class AbstractResource {

  id: string;
  uri: string;
  codeValue: string;
  modified: Moment;
  prefLabel: Localizable;

  constructor(data: BaseResourceType) {
    this.id = data.id;
    this.uri = data.uri;
    this.codeValue = data.codeValue;
    this.modified = parseDateTime(data.modified);
    this.prefLabel = data.prefLabel || {};
  }
}
