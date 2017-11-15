import { Injectable } from '@angular/core';
import { Localizable } from '../entities/localization';
import { Subject } from 'rxjs/Subject';
import { CodeScheme } from '../entities/code-scheme';
import { Code } from '../entities/code';

export interface Location {
  localizationKey?: string;
  label?: Localizable;
  route?: any[];
}

const frontPage = { localizationKey: 'Front page', route: [''] };

const codeSchemePage = { localizationKey: 'CodeScheme page', route: ['codeschemes'] };

const codePage = { localizationKey: 'Code page', route: ['codes'] };

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

  atCodeSchemePage(codeScheme: CodeScheme): void {
    const codeSchemeLabel: Localizable = {};
    codeSchemeLabel['fi'] = 'Koodisto: ' + codeScheme.prefLabels.fi;
    this.changeLocation([
      {
        label: codeSchemeLabel,
        route: ['/codescheme',
          { codeRegistryCodeValue: codeScheme.codeRegistry.codeValue, codeSchemeCodeValue: codeScheme.codeValue }]
        // route: ['coderegistries', codeScheme.codeRegistry.codeValue, 'codeschemes', codeScheme.codeValue]
      }
    ]);
  }

  atCodePage(code: Code): void {
    const codeLabel: Localizable = {};
    codeLabel['fi'] = 'Koodi: ' + code.prefLabels.fi;
    const codeSchemeLabel: Localizable = {};
    codeSchemeLabel['fi'] = 'Koodisto: ' + code.codeScheme.codeValue + '-' + code.codeScheme.prefLabels.fi;
    this.changeLocation([
      {
        label: codeSchemeLabel,
        // route: ['coderegistries', code.codeScheme.codeRegistry.codeValue, 'codeschemes', code.codeScheme.codeValue]
        route: ['/codescheme',
          { codeRegistryCodeValue: code.codeScheme.codeRegistry.codeValue, codeSchemeCodeValue: code.codeScheme.codeValue }]
      },
      {
        label: codeLabel,
        // route: ['coderegistries', code.codeScheme.codeRegistry.codeValue, 'codeschemes', code.codeScheme.codeValue, 'codes', code.codeValue]
        route: ['/code',
          { codeRegistryCodeValue: code.codeScheme.codeRegistry.codeValue, codeSchemeCodeValue: code.codeScheme.codeValue, codeCodeValue: code.codeValue }]
      }
    ]);
  }
}
