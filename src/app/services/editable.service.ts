import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ErrorModalService } from '../components/common/error-modal.component';

export interface EditingComponent {
  isEditing(): boolean;
  cancelEditing(): void;
}

@Injectable()
export class EditableService {

  editing$ = new BehaviorSubject<boolean>(false);
  saving$ = new BehaviorSubject<boolean>(false);

  _onSave: (formValue: any) => Observable<any>;
  _onCancel: () => void;

  constructor(private errorModalService: ErrorModalService) {
  }

  set onSave(value: (formValue: any) => Observable<any>) {
    if (this._onSave) {
      throw new Error('Save handler already set');
    }
    this._onSave = value;
  }

  set onCancel(value: () => void) {
    if (this._onCancel) {
      throw new Error('Cancel handler already set');
    }
    this._onCancel = value;
  }

  get editing() {
    return this.editing$.getValue();
  }

  get saving() {
    return this.saving$.getValue();
  }

  edit() {
    this.editing$.next(true);
  }

  cancel() {

    if (!this._onCancel) {
      throw new Error('Cancel handler missing');
    }

    this.editing$.next(false);
    this._onCancel();
  }

  save(formValue: any) {

    if (!this._onSave) {
      throw new Error('Save handler missing');
    }

    const that = this;
    this.saving$.next(true);

    this._onSave(formValue).subscribe({
      next() {
        that.saving$.next(false);
        that.editing$.next(false);
      },
      error(err: any) {
        that.saving$.next(false);
        that.errorModalService.openSubmitError(err);
      }
    });
  }
}
