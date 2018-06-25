import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CodeScheme } from '../../entities/code-scheme';
import { AuthorizationManager } from '../../services/authorization-manager.service';
import { ignoreModalClose } from 'yti-common-ui/utils/modal';
import { CodeSchemeComponent } from './code-scheme.component';
import { ExtensionScheme } from '../../entities/extension-scheme';
import { ExtensionSchemesImportModalService } from '../extensionscheme/extension-scheme-import-modal.component';

@Component({
  selector: 'app-code-scheme-extensionschemes',
  templateUrl: './code-scheme-extensionschemes.component.html',
  styleUrls: ['./code-scheme-extensionschemes.component.scss']
})
export class CodeSchemeExtensionSchemesComponent {

  @Input() extensionSchemes: ExtensionScheme[];
  @Input() codeScheme: CodeScheme;

  constructor(private codeSchemeComponent: CodeSchemeComponent,
              private extensionSchemesImportModalService: ExtensionSchemesImportModalService,
              private router: Router,
              private authorizationManager: AuthorizationManager) {
  }

  importExtensionSchemes() {
    this.codeSchemeComponent.importExtensionSchemes();
  }

  createExtensionScheme() {
    this.codeSchemeComponent.createExtensionScheme();
  }

  canAddExtensionScheme() {
    return this.authorizationManager.canEdit(this.codeScheme);
  }
}
