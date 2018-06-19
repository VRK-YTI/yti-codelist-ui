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

  importExtensions() {
    this.extensionSchemesImportModalService.open(this.codeScheme).then(success => {
      if (success) {
        this.codeSchemeComponent.refreshExtensionSchemes();
      }
    }, ignoreModalClose);
  }

  createExtensionScheme() {
    console.log('Create extensionScheme clicked!');
    this.router.navigate(
      ['createextensionscheme',
        {
          registryCode: this.codeScheme.codeRegistry.codeValue,
          schemeCode: this.codeScheme.codeValue
        }
      ]
    );
  }

  canAddExtensionScheme() {
    return this.authorizationManager.canEdit(this.codeScheme);
  }
}
