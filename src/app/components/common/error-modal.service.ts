import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorModalService } from '@vrk-yti/yti-common-ui';

@Injectable()
export class CodeListErrorModalService {

  constructor(private errorModalService: ErrorModalService) {
  }

  openSubmitError(error: any) {
    const showDebug = false; // TODO luetaan oikeasti jostain ympäristökonfiguraatiosta
    if (error instanceof HttpErrorResponse) {
      const body = error.error;
      this.errorModalService.openWithOptions({
        title: 'Submit error',
        body: body.meta ? body.meta.message : body,
        bodyParams: { identifier: body.meta.entityIdentifier },
        nonTranslatableMessage: body.meta.nonTranslatableMessage,
        err: showDebug ? error : undefined,
      });
    } else {
      this.errorModalService.openSubmitError(showDebug ? error : undefined);
    }
  }

  open(title: string, body: string, error?: any) {

    this.errorModalService.open(title, body, error);
  }
}
