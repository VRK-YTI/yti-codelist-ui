import { MetaType } from '../services/api-schema';

export class Meta {

  message: string;
  code: number;
  entityIdentifier?: string;
  nonTranslatableMessage?: string;
  totalResults: number;
  resultCount: number;
  from: number;

  constructor(data: MetaType) {

    this.message = data.message;
    this.code = data.code;
    this.entityIdentifier = data.entityIdentifier;
    this.nonTranslatableMessage = data.nonTranslatableMessage;
    this.totalResults = data.totalResults;
    this.resultCount = data.resultCount;
    this.from = data.from;
  }

  serialize(): MetaType {

    return {
      message: this.message,
      code: this.code,
      entityIdentifier: this.entityIdentifier ? this.entityIdentifier : undefined,
      nonTranslatableMessage: this.nonTranslatableMessage ? this.nonTranslatableMessage : undefined,
      totalResults: this.totalResults,
      resultCount: this.resultCount,
      from: this.from
    };
  }

  clone(): Meta {

    return new Meta(this.serialize());
  }
}
