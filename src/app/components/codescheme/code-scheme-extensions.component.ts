import { Component, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CodeScheme } from '../../entities/code-scheme';
import { AuthorizationManager } from '../../services/authorization-manager.service';
import { CodeSchemeComponent } from './code-scheme.component';
import { Extension, groupByType, PropertyTypeExtensions } from '../../entities/extension';
import { ExtensionImportModalService } from '../extension/extension-import-modal.component';
import { TranslateService } from '@ngx-translate/core';
import { NgbNav } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-code-scheme-extensions',
  templateUrl: './code-scheme-extensions.component.html',
  styleUrls: ['./code-scheme-extensions.component.scss']
})
export class CodeSchemeExtensionsComponent {
  @ViewChild('secondaryNav') secondaryNav: NgbNav;

  @Input() extensions: Extension[];
  @Input() codeScheme: CodeScheme;

  constructor(private codeSchemeComponent: CodeSchemeComponent,
              private extensionImportModalService: ExtensionImportModalService,
              private router: Router,
              private authorizationManager: AuthorizationManager,
              private translateService: TranslateService) {
  }

  get extensionsByType(): PropertyTypeExtensions[] {
    const filteredExtensions: Extension[] = this.extensions.filter(es => es.propertyType.context === 'Extension')
    return groupByType(this.translateService, filteredExtensions);
  }

  get codeExtensions(): Extension[] {
    return this.extensions.filter(es => es.propertyType.context === 'CodeExtension');
  }

  get hasCodeExtensions(): boolean {
    const extensions = this.codeExtensions;
    return extensions != null && extensions.length > 0;
  }
}
