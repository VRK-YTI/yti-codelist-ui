import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Injectable } from '@angular/core';

@Injectable()
export class EditableService {

  editing$ = new BehaviorSubject<boolean>(false);
  saving$ = new BehaviorSubject<boolean>(false);

  get editing() {
    return this.editing$.getValue();
  }

  set editing(value: boolean) {
    this.editing$.next(value);
  }

  get saving() {
    return this.saving$.getValue();
  }

  set saving(value: boolean) {
    this.saving$.next(value);
  }
}
