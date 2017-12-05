import { Localizable } from './localization';

export class DataClassification {

  id: string;
  uri: string;
  status: string;
  modified: string;
  codeValue: string;
  prefLabel: Localizable;
  codeScheme: { uri: string };
  count: number;
  filteredCount: number;

  updateCount(id: string) {
    if (id === this.id) {
      this.filteredCount++;
    } 
  }
  resetCount() {
    this.filteredCount = 0;
  }
}
