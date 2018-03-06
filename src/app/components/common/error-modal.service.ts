import { ApiResponseType } from '../../services/api-schema';
import { ErrorModalService } from 'yti-common-ui/components/error-modal.component';
import { Injectable } from '@angular/core';

@Injectable()
export class CodeListErrorModalService {

  constructor(private errorModalService: ErrorModalService) {
  }

  openSubmitError(error: ApiResponseType) {

    const showDebug = false; // TODO luetaan oikeasti jostain ympäristökonfiguraatiosta

    this.errorModalService.openWithOptions({
      title: 'Submit error',
      body: error.meta.message,
      bodyParams: error.meta.entityIdentifier,
      err: showDebug ? error : undefined
    });
  }
}
