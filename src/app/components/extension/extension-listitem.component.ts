import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Extension } from '../../entities/extension';

@Component({
  selector: 'app-extension-listitem',
  styleUrls: ['./extension-listitem.component.scss'],
  template: `
    <div id="{{getIdIdentifier(extension) + '_view_extension'}}" class="extension" (click)="viewExtension(extension)">
      <app-status class="pull-right status" [status]="extensionScheme.status"></app-status>
      <span *ngIf="extension.code.hasPrefLabel()" class="extensiontitle">{{extension.code.codeValue}} - {{extension.code.prefLabel | translateValue}}</span>
      <span *ngIf="!extension.code.hasPrefLabel()" class="extensiontitle">{{extension.code.codeValue}}</span>
    </div>
  `
})

export class ExtensionListitemComponent {

  @Input() extension: Extension;

  constructor(private router: Router) {
  }

  viewExtension(extension: Extension) {
    console.log('View extension: ' + extension.id);
    this.router.navigate([
      'extension',
      {
        registryCode: this.extension.extensionScheme.parentCodeScheme.codeRegistry.codeValue,
        schemeCode: this.extension.extensionScheme.parentCodeScheme.codeValue,
        extensionSchemeCode: extension.extensionScheme.codeValue,
        extensionId: extension.id
      }
    ]);
  }

  getIdIdentifier(extension: Extension) {
    return `${this.extension.id}`;
  }
}
