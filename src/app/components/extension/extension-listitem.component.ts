import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Extension } from '../../entities/extension';

@Component({
  selector: 'app-extension-listitem',
  styleUrls: ['./extension-listitem.component.scss'],
  template: `
    <div id="{{getIdIdentifier(extension) + '_view_extension'}}"
         class="extension"
         (click)="viewExtension(extension)">
      <app-status class="float-right status"
                  [status]="extension.status"></app-status>
      <span *ngIf="extension.hasPrefLabel()"
            class="extensiontitle">{{extension.codeValue}} - {{extension.prefLabel | translateValue}}</span>
      <span *ngIf="!extension.hasPrefLabel()"
            class="extensiontitle">{{extension.codeValue}}</span>
    </div>
  `
})

export class ExtensionListitemComponent {

  @Input() extension: Extension;

  constructor(private router: Router) {
  }

  viewExtension(extension: Extension) {
    this.router.navigate([
      'extension',
      {
        registryCode: this.extension.parentCodeScheme.codeRegistry.codeValue,
        schemeCode: this.extension.parentCodeScheme.codeValue,
        extensionCode: extension.codeValue
      }
    ]);
  }

  getIdIdentifier(extension: Extension) {
    return `${this.extension.parentCodeScheme.codeRegistry.codeValue}_` +
      `${this.extension.parentCodeScheme.codeValue}` +
      `${extension.codeValue}`;
  }
}
