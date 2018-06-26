import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ExtensionScheme } from '../../entities/extension-scheme';

@Component({
  selector: 'app-extensionscheme-listitem',
  styleUrls: ['./extension-scheme-listitem.component.scss'],
  template: `
    <div id="{{getIdIdentifier(extensionScheme) + '_view_extensionscheme'}}"
         class="extensionScheme"
         (click)="viewExtensionScheme(extensionScheme)">
      <app-status class="pull-right status"
                  [status]="extensionScheme.status"></app-status>
      <span *ngIf="extensionScheme.hasPrefLabel()"
            class="extensionschemetitle">{{extensionScheme.codeValue}} - {{extensionScheme.prefLabel | translateValue}}</span>
      <span *ngIf="!extensionScheme.hasPrefLabel()"
            class="extensionschemetitle">{{extensionScheme.codeValue}}</span>
    </div>
  `
})

export class ExtensionSchemeListitemComponent {

  @Input() extensionScheme: ExtensionScheme;

  constructor(private router: Router) {
  }

  viewExtensionScheme(extensionScheme: ExtensionScheme) {
    console.log('View extensionScheme: ' + extensionScheme.codeValue);
    this.router.navigate([
      'extensionscheme',
      {
        registryCode: this.extensionScheme.parentCodeScheme.codeRegistry.codeValue,
        schemeCode: this.extensionScheme.parentCodeScheme.codeValue,
        extensionSchemeCode: extensionScheme.codeValue
      }
    ]);
  }

  getIdIdentifier(extensionScheme: ExtensionScheme) {
    return `${this.extensionScheme.parentCodeScheme.codeRegistry.codeValue}_` +
      `${this.extensionScheme.parentCodeScheme.codeValue}` +
      `${extensionScheme.codeValue}`;
  }
}
