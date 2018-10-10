import { Localizable } from 'yti-common-ui/types/localization';
import { InfoDomainType } from '../services/api-schema';

export class InfoDomain {

  id: string;
  uri: string;
  status: string;
  codeValue: string;
  prefLabel: Localizable;
  count: number;

  constructor(data: InfoDomainType) {
    this.id = data.id;
    this.uri = data.uri;
    this.status = data.status;
    this.codeValue = data.codeValue;
    this.prefLabel = data.prefLabel || {};
    this.count = data.count;
  }

  serialize(): InfoDomainType {
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
    return new InfoDomain(this.serialize());
  }
}
