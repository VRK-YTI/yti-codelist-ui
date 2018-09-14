import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ExtensionScheme } from '../../entities/extension-scheme';
import { LanguageService } from '../../services/language.service';
import { TranslateService } from '@ngx-translate/core';
import { ExtensionSimple } from '../../entities/extension-simple';

@Component({
  selector: 'app-hierarchy-extension',
  styleUrls: ['./hierarchy-extension.component.scss'],
  template: `

    <i [id]="getIdIdentifier() + '_hierarchy_extension_expand'" [hidden]="!hasChildren() || expanded" class="icon fa fa-plus" (click)="expand()"></i>
    <i [id]="getIdIdentifier() + '_hierarchy_extension_collapse'" [hidden]="!hasChildren() || collapsed" class="icon fa fa-minus" (click)="collapse()"></i>
    <i id="hierarchy_extension_aligner" [hidden]="hasChildren()" class="icon fa"></i>

    <div [id]="getIdIdentifier() + '_view_extension'" class="extension" (click)="viewExtension()">
      <span class="extensiontitle">{{extension.getDisplayName(languageService, translateService)}}</span>
    </div>

    <ul *ngIf="expanded && hasChildren()">
      <li class="child-extension" *ngFor="let extension of children; trackBy: extensionIdentity">        
        <app-hierarchy-extension [extensions]="extensions"
                                 [extension]="extension" 
                                 [codeRegistryCodeValue]="codeRegistryCodeValue"
                                 [codeSchemeCodeValue]="codeSchemeCodeValue"
                                 [extensionSchemeCodeValue]="extensionSchemeCodeValue" 
                                 [ignoreHierarchy]="ignoreHierarchy"></app-hierarchy-extension>
      </li>
    </ul>
  `
})

export class HierarchyExtensionComponent {

  @Input() extensions: ExtensionSimple[];
  @Input() extension: ExtensionSimple;
  @Input() codeRegistryCodeValue: string;
  @Input() codeSchemeCodeValue: string;
  @Input() extensionSchemeCodeValue: string;
  @Input() ignoreHierarchy: boolean;

  constructor(private router: Router,
              public languageService: LanguageService,
              public translateService: TranslateService) {
  }

  get children() {
    return this.extensions.filter(extension => this.extension.extension ? extension.id === this.extension.extension.id : false);
  }

  get expanded() {
    return this.extension.expanded;
  }

  get collapsed() {
    return !this.expanded;
  }

  expand() {
    this.extension.expanded = true;
  }

  collapse() {
    this.extension.expanded = false;
  }

  hasChildren() {
    return this.children.length > 0 && !this.ignoreHierarchy;
  }

  viewExtension() {
    console.log('View member: ' + this.extension.id);
    this.router.navigate([
      'extension',
      {
        registryCode: this.codeRegistryCodeValue,
        schemeCode: this.codeSchemeCodeValue,
        extensionSchemeCode: this.extensionSchemeCodeValue,
        extensionId: this.extension.id
      }
    ]);
  }

  extensionIdentity(index: number, item: ExtensionSimple) {
    return item.id;
  }

  getIdIdentifier() {
    return `${this.extension.id}`;
  }
}
