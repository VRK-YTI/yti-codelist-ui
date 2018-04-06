import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { CodeScheme } from '../entities/code-scheme';
import { Code } from '../entities/code';
import { Location } from 'yti-common-ui/types/location';

const frontPage = { localizationKey: 'Front page', route: [''] };

@Injectable()
export class LocationService {

  location = new Subject<Location[]>();

  private changeLocation(location: Location[]): void {
    if (location.length > 0) {
      location.unshift(frontPage);
    }
    this.location.next(location);
  }

  atFrontPage(): void {
    this.changeLocation([]);
  }

  atUserDetails(): void {
    this.changeLocation([{
      localizationKey: 'User details',
      route: ['userDetails']
    }]);
  }

  atCodeSchemePage(codeScheme: CodeScheme): void {
    this.changeLocation(codeScheme.location);
  }

  atCodePage(code: Code): void {
    this.changeLocation(code.location);
  }

  atInformationAboutService(): void {
    this.changeLocation([{
      localizationKey: 'Information about the service',
      route: ['information']
    }]);
  }
}
