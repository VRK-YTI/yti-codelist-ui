import { Localizable } from 'yti-common-ui/types/localization';
import { Moment } from 'moment';
import { BaseResourceType } from '../services/api-schema';
import { parseDateTime } from '../utils/date';

export class ErrorModel {

  code: string;
  message: string;

  constructor(code: string, message: string ) {
    this.code = code;
    this.message = message;
  }
}
