import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { EditingComponent } from '../../services/editable.service';
import { ConfirmationModalService } from './confirmation-modal.component';

@Injectable()
export class EditGuard implements CanDeactivate<EditingComponent> {

  constructor(private confirmationModalService: ConfirmationModalService) {
  }

  canDeactivate(target: EditingComponent) {
    if (!target.isEditing()) {
      return Promise.resolve(true);
    } else {
      return this.confirmationModalService.openEditInProgress().then(() => true, () => false);
    }
  }
}
