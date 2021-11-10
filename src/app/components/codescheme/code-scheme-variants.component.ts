import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CodeScheme } from '../../entities/code-scheme';
import { DataService } from '../../services/data.service';
import { CodeSchemeListItem } from '../../entities/code-scheme-list-item';
import { CodeListConfirmationModalService } from '../common/confirmation-modal.service';
import { AuthorizationManager } from '../../services/authorization-manager.service';
import { ConfigurationService } from '../../services/configuration.service';
import { LanguageService } from '../../services/language.service';
import { ignoreModalClose } from '@vrk-yti/yti-common-ui';

@Component({
  selector: 'app-code-scheme-variants',
  templateUrl: './code-scheme-variants.component.html',
  styleUrls: ['./code-scheme-variants.component.scss']
})
export class CodeSchemeVariantsComponent {

  @Input() codeScheme: CodeScheme;
  @Output() detachVariantRequest = new EventEmitter<CodeSchemeListItem>();

  constructor(private languageService: LanguageService,
              private dataService: DataService,
              private confirmationModalService: CodeListConfirmationModalService,
              private authorizationManager: AuthorizationManager,
              private configurationService: ConfigurationService) {
  }

  detachAVariant(chosenVariantCodeScheme: CodeSchemeListItem) {
    this.confirmationModalService.openDetachVariant()
      .then(() => {
        return this.dataService.detachAVariantFromCodeScheme(this.codeScheme.codeRegistry, chosenVariantCodeScheme.id,
          this.codeScheme.serialize())
          .subscribe(resultCodeScheme => {
            this.detachVariantRequest.emit(chosenVariantCodeScheme);
          });
      }, ignoreModalClose);
  }

  canAttachOrDetachAVariant(): boolean {
    return this.authorizationManager.canEdit(this.codeScheme);
  }

  getVariantUri(variantUri: string): string | null {
    return this.configurationService.getUriWithEnv(variantUri);
  }

  getVariantDisplayName(variant: CodeSchemeListItem): string {
    return variant.getDisplayName(this.languageService, false);
  }
}
