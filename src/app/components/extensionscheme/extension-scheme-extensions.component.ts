import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthorizationManager } from '../../services/authorization-manager.service';
import { ignoreModalClose } from 'yti-common-ui/utils/modal';
import { Extension } from '../../entities/extension';
import { ExtensionScheme } from '../../entities/extension-scheme';
import { ExtensionSchemeComponent } from './extension-scheme.component';
import { ExtensionSchemeExtensionsImportModalService } from '../extension/extension-import-modal.component';

@Component({
  selector: 'app-extension-scheme-extensions',
  templateUrl: './extension-scheme-extensions.component.html',
  styleUrls: ['./extension-scheme-extensions.component.scss']
})
export class ExtensionSchemeExtensionsComponent {

  @Input() extensions: Extension[];
  @Input() extensionScheme: ExtensionScheme;

  constructor(private extensionSchemeComponent: ExtensionSchemeComponent,
              private extensionSchemeExtensionsImportModalService: ExtensionSchemeExtensionsImportModalService,
              private router: Router,
              private authorizationManager: AuthorizationManager) {
  }

  importMembers() {
    this.extensionSchemeExtensionsImportModalService.open(this.extensionScheme).then(success => {
      if (success) {
        this.extensionSchemeComponent.refreshExtensions();
      }
    }, ignoreModalClose);
  }

  createMember() {
    console.log('Member create clicked.');
    this.router.navigate(
      ['createmember',
        {
          registryCode: this.extensionScheme.parentCodeScheme.codeRegistry.codeValue,
          schemeCode: this.extensionScheme.parentCodeScheme.codeValue,
          extensionSchemeCode: this.extensionScheme.codeValue
        }
      ]
    );
  }

  canAddExtension() {
    return this.authorizationManager.canEdit(this.extensionScheme.parentCodeScheme) && !this.extensionScheme.restricted;
  }

  extensionIdentity(index: number, item: Extension) {
    return item.id;
  }

  getIdIdentifier(extension: Extension) {
    return `${this.extensionScheme.parentCodeScheme.codeRegistry.codeValue}_${this.extensionScheme.parentCodeScheme.codeValue}_` +
    `${this.extensionScheme.codeValue}_${extension.id}`;
  }
}
