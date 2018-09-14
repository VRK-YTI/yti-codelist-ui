import { Component, Input } from '@angular/core';
import { Extension } from '../../entities/extension';
import { ExtensionScheme } from '../../entities/extension-scheme';
import { ExtensionSimple } from '../../entities/extension-simple';
import { contains } from 'yti-common-ui/utils/array';
import { localizableMatches } from 'yti-common-ui/utils/localization';

@Component({
  selector: 'app-extension-scheme-extensions',
  templateUrl: './extension-scheme-extensions.component.html',
  styleUrls: ['./extension-scheme-extensions.component.scss']
})
export class ExtensionSchemeExtensionsComponent {

  @Input() extensions: ExtensionSimple[];
  @Input() extensionScheme: ExtensionScheme;

  searchTerm = '';

  constructor() {
  }

  extensionIdentity(index: number, item: ExtensionSimple) {
    return item.id;
  }

  getIdIdentifier(extension: Extension) {
    return `${this.extensionScheme.parentCodeScheme.codeRegistry.codeValue}_${this.extensionScheme.parentCodeScheme.codeValue}_` +
    `${this.extensionScheme.codeValue}_${extension.id}`;
  }

  get listedExtensions() {
    return this.searchTerm ? this.filteredExtensions : this.topLevelExtensions;
  }

  get filteredExtensions() {
    return this.extensions.filter(extension =>
      extension.code.codeValue.toLowerCase().includes(this.searchTerm.toLowerCase()) 
      || localizableMatches(extension.code.prefLabel, this.searchTerm)
      || localizableMatches(extension.prefLabel, this.searchTerm)
    );
  }

  get topLevelExtensions() {
    return this.extensions.filter(extension => !contains(this.childExtensions, extension));
  }

  get parentExentensions() {
    return this.extensions.filter(extension => extension.extension);
  }

  get childExtensions() {
    return this.extensions.filter(extension => contains(this.parentExentensions.map(ext => ext.extension!.id), extension.id));
  }

  get numberOfExentensions() {
    return this.searchTermHasValue ? this.filteredExtensions.length : this.extensions.length;
  }

  get numberOfExpanded() {
    return this.parentExentensions.filter(extension => extension.expanded).length;
  }

  get numberOfCollapsed() {
    return this.parentExentensions.filter(extension => !extension.expanded).length;
  }

  get emptySearch() {
    return this.searchTerm && this.listedExtensions.length === 0;
  }

  hasHierarchy() {
    return this.extensions.filter(extension => extension.extension !== undefined).length > 0;
  }

  searchTermHasValue() {
    return this.searchTerm ? true : false;
  }

  hasExpanded() {
    return this.numberOfExpanded > 0;
  }

  hasCollapsed() {
    return this.numberOfCollapsed > 0;
  }

  expandAll() {
    this.extensions.map(extension => {
      if (contains(this.parentExentensions, extension)) {
        extension.expanded = true;
      }
    });
  }

  collapseAll() {
    this.extensions.map(extension => {
      if (contains(this.parentExentensions, extension)) {
        extension.expanded = false;
      }
    });
  }

  showExpandAll() {
    return this.hasCollapsed() && !this.searchTerm;
  }

  showCollapseAll() {
    return this.hasExpanded() && !this.searchTerm;
  }
}
