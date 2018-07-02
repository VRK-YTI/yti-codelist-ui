import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CodeRegistry } from '../../entities/code-registry';

@Component({
  selector: 'app-code-registry-listitem',
  styleUrls: ['./registry-listitem.scss'],
  template: `
    <div id="{{getIdIdentifier(codeRegistry) + '_view_code_registry'}}"
         class="codeRegistry"
         (click)="viewCodeRegistry(codeRegistry)">
      <span *ngIf="codeRegistry.hasPrefLabel()"
            class="registrytitle">{{codeRegistry.codeValue}} - {{codeRegistry.prefLabel | translateValue}}</span>
      <span *ngIf="!codeRegistry.hasPrefLabel()"
            class="registrytitle">{{codeRegistry.codeValue}}</span>
    </div>
  `
})

export class RegistryListitemComponent {

  @Input() codeRegistry: CodeRegistry;

  constructor(private router: Router) {
  }

  viewCodeRegistry(codeRegistry: CodeRegistry) {
    console.log('View codeRegistry: ' + this.codeRegistry.codeValue);
    this.router.navigate(codeRegistry.route);
  }

  getIdIdentifier(codeRegistry: CodeRegistry) {
    return `${codeRegistry.codeValue}`;
  }
}
