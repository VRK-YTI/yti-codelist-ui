import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class LoadingIndicatorService { // can be used to indicate that loading is ON/OFF to child components in tabSet for example.

  private loadingStartedAnnouncement = new Subject<string>();
  private loadingFinishedAnnouncement = new Subject<string>();

  loadingStarted$ = this.loadingStartedAnnouncement.asObservable();
  loadingFinished$ = this.loadingFinishedAnnouncement.asObservable();

  announceLoadingStarted(irrelevant: string) {
    this.loadingStartedAnnouncement.next(irrelevant);
  }

  announceLoadingFinished(irrelevant: string) {
    this.loadingFinishedAnnouncement.next(irrelevant);
  }
}
