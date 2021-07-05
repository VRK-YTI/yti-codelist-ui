import { Injectable } from '@angular/core';
import { ConfirmationModalService } from '@vrk-yti/yti-common-ui';
import { CodeScheme } from '../../entities/code-scheme';

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
       'CHANGE_STATUS_CONFIRMATION_PARAGRAPH_1', 'STATUS_CONFIRMATION_PARAGRAPH_2');
  }

  openChooseToRestrictedStatus() {
    return this.confirmationModalService.open('CHOOSE STATUS?', undefined,
       'CHOOSE_STATUS_CONFIRMATION_PARAGRAPH_1', 'STATUS_CONFIRMATION_PARAGRAPH_2');
  }

  openSuggestConcept(concept: string, definition: string, vocabulary: string) {
    const translateParams = { concept: concept, vocabulary: vocabulary };
    return this.confirmationModalService.open('SUGGEST CONCEPT?', translateParams, 'SUGGEST CONCEPT MODAL QUESTION');
  }

  openCreateNewCodeSchemeVersionAsEmpty() {
    return this.confirmationModalService.open('Are you sure you want to create the version as empty?', undefined,  '');
  }

  openCreateMissingExtensionMembers(codeSchemes: CodeScheme[]) {
    const nonTranslatableBodyParagraphs: string[] = codeSchemes.map(cs => cs.uri);
    const bodyParagraphs = new Array('CREATE MISSING MEMBERS MODAL BODY TEXT');
    return this.confirmationModalService.openWithNonTranslatableContentAlsoPresent('CREATE MISSING MEMBERS MODAL TITLE', nonTranslatableBodyParagraphs, undefined, ...bodyParagraphs);
  }

  openChangeCodeStatusesAlsoAlongWithTheCodeSchemeStatus(startStatus: string, endStatus: string) {
    const translateParams = { startStatus: startStatus, endStatus: endStatus };
    return this.confirmationModalService.open('Change code statuses at the same time?', translateParams,
      'CHANGE CODE STATUSES TOO?');
  }

  openAddSubscription() {
    return this.confirmationModalService.open('ADD EMAIL SUBSCRIPTION TO RESOURCE REGARDING CHANGES?', undefined, '');
  }

  openRemoveSubscription() {
    return this.confirmationModalService.open('REMOVE EMAIL SUBSCRIPTION TO RESOURCE?', undefined, '');
  }

  openToggleNotifications(enable: boolean) {
    if (enable) {
      return this.confirmationModalService.open('ARE YOU SURE YOU WANT TO ENABLE THE NOTIFICATION EMAIL SUBSCRIPTION?', undefined, '');
    } else {
      return this.confirmationModalService.open('ARE YOU SURE YOU WANT TO DISABLE THE NOTIFICATION EMAIL SUBSCRIPTION?', undefined, '');
    }
  }
}
