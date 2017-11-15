import { Localizable } from './localization';

export class DataClassification {

  codeValue: string;
  prefLabels: Localizable;
  codeScheme: { uri: string };
  count: number;
}
