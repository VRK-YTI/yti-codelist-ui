import { Localizable } from 'yti-common-ui/types/localization';
import { CodeType, DeepSearchHitListCodeType, SearchHitType } from '../services/api-schema';
import { SearchHit } from './search-hit';
import { Code } from './code';
import { CodePlain } from './code-simple';

export class DeepSearchHitListCode {

  type: 'CODE';
  totalHitCount: number;
  topHits: CodePlain[];

  constructor(data: DeepSearchHitListCodeType) {
    this.type = data.type;
    this.totalHitCount = data.totalHitCount;
    this.topHits = (data.topHits || []).map(th => new CodePlain(th));
  }

  serialize(): DeepSearchHitListCodeType {
    return {
      type: this.type,
      totalHitCount: this.totalHitCount,
      topHits: (this.topHits || []).map(th => th.serialize())
    };
  }

  clone(): DeepSearchHitListCode {
    return new DeepSearchHitListCode(this.serialize());
  }
}
