import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class EditableService {

  editing$ = new BehaviorSubject<boolean>(false);
  saving$ = new BehaviorSubject<boolean>(false);

  onSave: () => Observable<any>;
  onCanceled: () => void;

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

    if (!this.onCanceled) {
      throw new Error('Cancel handler missing');
    }

    this.editing$.next(false);
    this.onCanceled();
  }

  save() {

    if (!this.onSave) {
      throw new Error('Save handler missing');
    }

    const that = this;
    this.saving$.next(true);

    this.onSave().subscribe({
      next() {
        that.saving$.next(false);
        that.editing$.next(false);
      },
      error() {
        that.saving$.next(false);
      }
    });
  }
}
