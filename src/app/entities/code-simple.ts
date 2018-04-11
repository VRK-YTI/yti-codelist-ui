import { AbstractResource } from './abstract-resource';
import { formatDateTime, formatDisplayDateTime } from '../utils/date';
import { Status } from 'yti-common-ui/entities/status';
import { CodePlainType } from '../services/api-schema';

export class CodePlain extends AbstractResource {

  status: Status = 'DRAFT';
  broaderCodeId: string;
  hierarchyLevel: number;
  expanded: boolean;

  constructor(data: CodePlainType) {
    super(data);

    if (data.status) {
      this.status = data.status;
    }
    if (data.broaderCodeId) {
      this.broaderCodeId = data.broaderCodeId;
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
      modified: formatDateTime(this.modified),
      prefLabel: {...this.prefLabel},
      status: this.status,
      broaderCodeId: this.broaderCodeId,
      hierarchyLevel: this.hierarchyLevel
    };
  }

  clone(): CodePlain {
    return new CodePlain(this.serialize());
  }
}
