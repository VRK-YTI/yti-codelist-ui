import { Localizable } from 'yti-common-ui/types/localization';
import { DataClassificationType } from '../services/api-schema';

export class DataClassification {

  id: string;
  uri: string;
  status: string;
  codeValue: string;
  prefLabel: Localizable;
  count: number;

  constructor(data: DataClassificationType) {
    this.id = data.id;
    this.uri = data.uri;
    this.status = data.status;
    this.codeValue = data.codeValue;
    this.prefLabel = data.prefLabel || {};
    this.count = data.count;
  }

  serialize(): DataClassificationType {
    return {
      id: this.id,
      uri: this.uri,
      status: this.status,
      codeValue: this.codeValue,
      prefLabel: { ...this.prefLabel },
      count: this.count
    };
  }

  clone() {
    return new DataClassification(this.serialize());
  }
}
