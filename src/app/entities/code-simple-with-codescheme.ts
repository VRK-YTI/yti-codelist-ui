import { CodePlainWithCodeSchemeType } from '../services/api-schema';
import { CodeScheme } from './code-scheme';
import { CodePlain } from './code-simple';

export class CodePlainWithCodeScheme extends CodePlain {

  codeScheme: CodeScheme;

  constructor(data: CodePlainWithCodeSchemeType) {
    super(data);

    this.codeScheme = new CodeScheme(data.codeScheme);
  }

  serialize(): CodePlainWithCodeSchemeType {
    return {
      id: this.id,
      uri: this.uri,
      url: this.url,
      codeValue: this.codeValue,
      prefLabel: { ...this.prefLabel },
      status: this.status,
      broaderCode: this.broaderCode ? this.broaderCode.serialize() : undefined,
      hierarchyLevel: this.hierarchyLevel,
      codeScheme: this.codeScheme.serialize()
    };
  }

  clone(): CodePlain {
    return new CodePlain(this.serialize());
  }
}
