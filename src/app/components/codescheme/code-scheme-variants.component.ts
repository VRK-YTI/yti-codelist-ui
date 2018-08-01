import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CodeScheme} from '../../entities/code-scheme';
import {ignoreModalClose} from 'yti-common-ui/utils/modal';
import {CodeschemeVariantModalService} from '../codeschemevariant/codescheme-variant.modal.component';
import {DataService} from '../../services/data.service';
import {CodeSchemeListItem} from '../../entities/code-scheme-list-item';
import {AuthorizationManager} from '../../services/authorization-manager.service';
import {CodeRegistry} from '../../entities/code-registry';
import { CodeListConfirmationModalService } from '../common/confirmation-modal.service';

@Component({
  selector: 'app-code-scheme-variants',
  templateUrl: './code-scheme-variants.component.html',
  styleUrls: ['./code-scheme-variants.component.scss']
})
export class CodeSchemeVariantsComponent {

  @Input() codeScheme: CodeScheme;
  @Input() codeRegistries: CodeRegistry[];
  @Output() detachVariantRequest = new EventEmitter<CodeSchemeListItem>();

  chosenCodeScheme: CodeScheme;

  constructor(private codeschemeVariantModalService: CodeschemeVariantModalService,
              private dataService: DataService,
              private authorizationManager: AuthorizationManager,
              private confirmationModalService: CodeListConfirmationModalService) {
  }

  openVariantSearchModal() {
    this.codeschemeVariantModalService.open()
      .then(codeScheme => this.putChosenVariantStuffInPlace(codeScheme), ignoreModalClose);
  }

  putChosenVariantStuffInPlace(chosenVariantCodeScheme: CodeScheme) {
    this.chosenCodeScheme = chosenVariantCodeScheme;

    return this.dataService.attachAVariantToCodeScheme(this.codeScheme.codeRegistry, chosenVariantCodeScheme.id, this.codeScheme)
      .subscribe(resultCodeScheme => {
        if (this.codeScheme.variantsOfThisCodeScheme) {
          const theStart = this.chosenCodeScheme.startDate ? this.chosenCodeScheme.startDate.toISOString() : undefined;
          const theEnd = this.chosenCodeScheme.endDate ? this.chosenCodeScheme.endDate.toISOString() : undefined;
          this.codeScheme.variantsOfThisCodeScheme.push(
            new CodeSchemeListItem( { id: this.chosenCodeScheme.id, prefLabel: this.chosenCodeScheme.prefLabel,
              uri: this.chosenCodeScheme.uri, startDate: theStart,
              endDate: theEnd, status: this.chosenCodeScheme.status} )
          );
        }
      });
  }

  detachAVariant(chosenVariantCodeScheme: CodeSchemeListItem) {
    this.confirmationModalService.openDetachVariant()
      .then(() => {
        return this.dataService.detachAVariantFromCodeScheme(this.codeScheme.codeRegistry, chosenVariantCodeScheme.id, this.codeScheme)
          .subscribe(resultCodeScheme => {
              this.detachVariantRequest.emit(chosenVariantCodeScheme);
          });
      }, ignoreModalClose);
  }

  canAttachAVariant(): boolean {
    return this.authorizationManager.canCreateACodeSchemeOrAVersionAndAttachAVariant(this.codeRegistries);
  }

}
