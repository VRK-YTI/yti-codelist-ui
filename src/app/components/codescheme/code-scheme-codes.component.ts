import { Component, Input } from '@angular/core';
import { CodeScheme } from '../../entities/code-scheme';
import { contains } from 'yti-common-ui/utils/array';
import { localizableMatches } from 'yti-common-ui/utils/localization';
import { CodePlain } from '../../entities/code-simple';

@Component({
  selector: 'app-code-scheme-codes',
  templateUrl: './code-scheme-codes.component.html',
  styleUrls: ['./code-scheme-codes.component.scss']
})
export class CodeSchemeCodesComponent {

  @Input() codes: CodePlain[];
  @Input() codeScheme: CodeScheme;

  searchTerm = '';

  constructor() {
  }

  get listedCodes() {
    return this.searchTerm ? this.filteredCodes : this.topLevelCodes;
  }

  get filteredCodes() {
    return this.codes.filter(code =>
      code.codeValue.toLowerCase().includes(this.searchTerm.toLowerCase()) || localizableMatches(code.prefLabel, this.searchTerm));
  }

  get topLevelCodes() {
    return this.codes.filter(code => !code.broaderCode);
  }

  get parentCodes() {
    const childCodes = this.codes.filter(code => code.broaderCode != null);
    const broaderCodeIds = childCodes.map(code => code.broaderCode!.id);

    return this.codes.filter(code => contains(broaderCodeIds, code.id));
  }

  get numberOfCodes() {
    return this.searchTermHasValue ? this.filteredCodes.length : this.codes.length;
  }

  hasHierarchy() {
    return this.codes.filter(code => code.broaderCode !== undefined).length > 0;
  }

  get numberOfExpanded() {
    return this.parentCodes.filter(code => code.expanded).length;
  }

  get numberOfCollapsed() {
    return this.parentCodes.filter(code => !code.expanded).length;
  }

  hasExpanded() {
    return this.numberOfExpanded > 0;
  }

  hasCollapsed() {
    return this.numberOfCollapsed > 0;
  }

  expandAll() {
    this.codes.map(code => {
      if (contains(this.parentCodes, code)) {
        code.expanded = true;
      }
    });
  }

  collapseAll() {
    this.codes.map(code => {
      if (contains(this.parentCodes, code)) {
        code.expanded = false;
      }
    });
  }

  showExpandAll() {
    return this.hasCollapsed() && !this.searchTerm;
  }

  showCollapseAll() {
    return this.hasExpanded() && !this.searchTerm;
  }

  get emptySearch() {
    return this.searchTerm && this.listedCodes.length === 0;
  }

  searchTermHasValue() {
    return this.searchTerm ? true : false;
  }

  codeIdentity(index: number, item: CodePlain) {
    return item.id;
  }

  getIdIdentifier(code: CodePlain) {
    return `${this.codeScheme.codeRegistry.codeValue}_${this.codeScheme.codeValue}_${code.codeValue}`;
  }
}
