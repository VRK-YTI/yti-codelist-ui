import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CodeScheme} from '../../entities/code-scheme';
import {ignoreModalClose} from 'yti-common-ui/utils/modal';
import {DataService} from '../../services/data.service';
import {CodeSchemeListItem} from '../../entities/code-scheme-list-item';
import {CodeRegistry} from '../../entities/code-registry';
import { CodeListConfirmationModalService } from '../common/confirmation-modal.service';
import {AuthorizationManager} from '../../services/authorization-manager.service';

@Component({
  selector: 'app-code-scheme-variants',
  templateUrl: './code-scheme-variants.component.html',
  styleUrls: ['./code-scheme-variants.component.scss']
})
export class CodeSchemeVariantsComponent {

  @Input() codeScheme: CodeScheme;
  @Input() codeRegistries: CodeRegistry[];
  @Output() detachVariantRequest = new EventEmitter<CodeSchemeListItem>();

  constructor(private dataService: DataService,
              private confirmationModalService: CodeListConfirmationModalService,
              private authorizationManager: AuthorizationManager) {
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
    return this.authorizationManager.canCreateACodeSchemeOrAVersionAndAttachAVariant(this.codeRegistries);
  }
}
