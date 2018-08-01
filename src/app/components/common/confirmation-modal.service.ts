import { ConfirmationModalService } from 'yti-common-ui/components/confirmation-modal.component';
import { Injectable } from '@angular/core';

@Injectable()
export class CodeListConfirmationModalService {

  constructor(private confirmationModalService: ConfirmationModalService) {
  }

  openEditInProgress() {
    return this.confirmationModalService.openEditInProgress();
  }

  openRemoveLink() {
    return this.confirmationModalService.open('REMOVE LINK?', '');
  }

  openRemoveCodeRegistry() {
    return this.confirmationModalService.open('REMOVE REGISTRY?', '');
  }

  openRemoveCode() {
    return this.confirmationModalService.open('REMOVE CODE?', '');
  }

  openRemoveCodeScheme() {
    return this.confirmationModalService.open('REMOVE CODE LIST?', '');
  }

  openRemoveExtensionScheme() {
    return this.confirmationModalService.open('REMOVE EXTENSION SCHEME?', '');
  }

  openRemoveExtension() {
    return this.confirmationModalService.open('REMOVE EXTENSION?', '');
  }

  openOverWriteExistingValuesFromVocabularies() {
    return this.confirmationModalService.open('Do you want to replace the existing values with new ones?', '');
  }

  openDetachVariant() {
    return this.confirmationModalService.open('DETACH VARIANT?', '');
  }
}
