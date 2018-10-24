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
    return this.confirmationModalService.open('REMOVE LINK?', undefined, '');
  }

  openRemoveCodeRegistry() {
    return this.confirmationModalService.open('REMOVE REGISTRY?', undefined, '');
  }

  openRemoveCode() {
    return this.confirmationModalService.open('REMOVE CODE?', undefined, '');
  }

  openRemoveCodeScheme() {
    return this.confirmationModalService.open('REMOVE CODE LIST?', undefined, '');
  }

  openRemoveExtension() {
    return this.confirmationModalService.open('REMOVE EXTENSION?', undefined, '');
  }

  openRemoveMember() {
    return this.confirmationModalService.open('REMOVE MEMBER?', undefined, '');
  }

  openOverWriteExistingValuesFromVocabularies() {
    return this.confirmationModalService.open('Do you want to replace the existing values with new ones?', undefined, '');
  }

  openDetachVariant() {
    return this.confirmationModalService.open('DETACH VARIANT?', undefined,  '');
  }

  openChangeToRestrictedStatus() {
    return this.confirmationModalService.open('CHANGE STATUS?', undefined,
       'CHANGE_STATUS_CONFIRMATION_PARAGRAPH_1', 'CHANGE_STATUS_CONFIRMATION_PARAGRAPH_2');
  }

  openChooseToRestrictedStatus() {
    return this.confirmationModalService.open('CHOOSE STATUS?', undefined,
       'CHOOSE_STATUS_CONFIRMATION_PARAGRAPH_1', 'CHOOSE_STATUS_CONFIRMATION_PARAGRAPH_2');
  }

  openSuggestConcept(concept: string, definition: string, vocabulary: string) {
    const translateParams = { concept: concept, vocabulary: vocabulary };
    return this.confirmationModalService.open('SUGGEST CONCEPT?', translateParams, 'SUGGEST CONCEPT MODAL QUESTION');
  }

  openCreateNewCodeSchemeVersionAsEmpty() {
    return this.confirmationModalService.open('DETACH VARIANT?', undefined,  '');
  }
}
