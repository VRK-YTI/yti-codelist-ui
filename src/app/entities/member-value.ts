import { MemberValueType } from '../services/api-schema';
import { Moment } from 'moment';
import { formatDateTime, parseDateTime } from '../utils/date';
import { ValueType } from './value-type';

export class MemberValue {

  id?: string;
  value: string;
  created: Moment | null = null;
  modified: Moment | null = null;
  valueType: ValueType;

  constructor(data: MemberValueType) {
    if (data.id) {
      this.id = data.id;
    }
    if (data.created) {
      this.created = parseDateTime(data.created);
    }
    if (data.modified) {
      this.modified = parseDateTime(data.modified);
    }
    this.valueType = new ValueType(data.valueType);
    this.value = data.value;
  }

  get idIdentifier(): string {
    return `${this.id}`;
  }

  serialize(): MemberValueType {
    return {
      id: this.id,
      value: this.value,
      created: formatDateTime(this.created),
      modified: formatDateTime(this.modified),
      valueType: this.valueType.serialize()
    }
  }

  clone() {
    return new MemberValue(this.serialize());
  }
}
