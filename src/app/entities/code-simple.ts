import { AbstractResource } from './abstract-resource';
import { Status } from 'yti-common-ui/entities/status';
import { CodePlainType } from '../services/api-schema';

export class CodePlain extends AbstractResource {

  status: Status = 'DRAFT';
  broaderCode: CodePlain|null = null;
  hierarchyLevel: number;
  expanded: boolean;

  constructor(data: CodePlainType) {
    super(data);

    if (data.status) {
      this.status = data.status;
    }
    if (data.broaderCode) {
      this.broaderCode = new CodePlain(data.broaderCode);
    }
    if (data.hierarchyLevel) {
      this.hierarchyLevel = data.hierarchyLevel;
    }
    this.expanded = false;
  }

  serialize(): CodePlainType {
    return {
      id: this.id,
      uri: this.uri,
      url: this.url,
      codeValue: this.codeValue,
      prefLabel: {...this.prefLabel},
      status: this.status,
      broaderCode: this.broaderCode ? this.broaderCode.serialize() : undefined,
      hierarchyLevel: this.hierarchyLevel
    };
  }

  clone(): CodePlain {
    return new CodePlain(this.serialize());
  }
}
