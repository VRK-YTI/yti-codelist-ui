import { Component, Input } from '@angular/core';
import { Extension } from '../../entities/extension';
import { ExtensionScheme } from '../../entities/extension-scheme';
import { ExtensionSimple } from '../../entities/extension-simple';

@Component({
  selector: 'app-extension-scheme-extensions',
  templateUrl: './extension-scheme-extensions.component.html',
  styleUrls: ['./extension-scheme-extensions.component.scss']
})
export class ExtensionSchemeExtensionsComponent {

  @Input() extensions: ExtensionSimple[];
  @Input() extensionScheme: ExtensionScheme;

  constructor() {
  }

  extensionIdentity(index: number, item: ExtensionSimple) {
    return item.id;
  }

  getIdIdentifier(extension: Extension) {
    return `${this.extensionScheme.parentCodeScheme.codeRegistry.codeValue}_${this.extensionScheme.parentCodeScheme.codeValue}_` +
      `${this.extensionScheme.codeValue}_${extension.id}`;
  }
}
