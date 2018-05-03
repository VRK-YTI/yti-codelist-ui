import { Localizable } from 'yti-common-ui/types/localization';
import { DataClassificationType } from '../services/api-schema';
import { Moment } from 'moment';
import { formatDateTime, parseDateTime } from '../utils/date';

export class DataClassification {

  id: string;
  uri: string;
  status: string;
  modified: Moment|null;
  codeValue: string;
  prefLabel: Localizable;
  codeScheme: { uri: string };
  count: number;

  constructor(data: DataClassificationType) {
    this.id = data.id;
    this.uri = data.uri;
    this.status = data.status;
    this.codeValue = data.codeValue;
    this.prefLabel = data.prefLabel || {};
    this.codeScheme = data.codeScheme;
    this.count = data.count;
  }

  serialize(): DataClassificationType {
    return {
      id: this.id,
      uri: this.uri,
      status: this.status,
      codeValue: this.codeValue,
      prefLabel: { ...this.prefLabel },
      codeScheme: this.codeScheme,
      count: this.count
    };
  }

  clone() {
    return new DataClassification(this.serialize());
  }
}
