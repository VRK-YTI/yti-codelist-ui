import { Component, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CodeScheme } from '../../entities/code-scheme';
import { AuthorizationManager } from '../../services/authorization-manager.service';
import { CodeSchemeComponent } from './code-scheme.component';
import { Extension, groupByType, PropertyTypeExtensions } from '../../entities/extension';
import { ExtensionImportModalService } from '../extension/extension-import-modal.component';
import { NgbTabset } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-code-scheme-extensions',
  templateUrl: './code-scheme-extensions.component.html',
  styleUrls: ['./code-scheme-extensions.component.scss']
})
export class CodeSchemeExtensionsComponent {
  @ViewChild('secondaryTabSet') secondaryTabSet: NgbTabset;

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

  get inlineExtensions(): Extension[] {
    return this.extensions.filter(es => es.propertyType.context === 'InlineExtension');
  }

  get hasInlineExtensions(): boolean {
    return this.inlineExtensions != null;
  }
}
