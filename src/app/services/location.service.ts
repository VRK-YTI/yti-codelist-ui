import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { CodeScheme } from '../entities/code-scheme';
import { Code } from '../entities/code';
import { Location } from 'yti-common-ui/types/location';
import { ExtensionScheme } from '../entities/extension-scheme';
import { Member } from '../entities/member';
import { CodeRegistry } from '../entities/code-registry';

const frontPage = { localizationKey: 'Front page', route: [''] };
const informationAboutServicePage = { localizationKey: 'Information about the service', route: ['information'] };
const codeSchemeImportAndCreatePage = { localizationKey: 'Add code list', route: ['importandcreatecodescheme'] };
const createNewVersionOfCodeSchemePage = { localizationKey: 'Create a new version', route: ['createcodescheme'] };
const createCodeSchemePage = { localizationKey: 'Create code list', route: ['createcodescheme'] };
const createCodePage = { localizationKey: 'Create code', route: ['createcode'] };
const createMemberPage = { localizationKey: 'Create member', route: ['createmember'] };
const createRegistryPage = { localizationKey: 'Create registry', route: ['createregistry'] };

@Injectable()
export class LocationService {

  location = new Subject<Location[]>();

  private changeLocation(location: Location[]): void {
    location.unshift(frontPage);
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

  atCodeRegistriesPage(): void {
    this.changeLocation([{
      localizationKey: 'Registries',
      route: ['registries']
    }]);
  }

  atRegistryPage(codeRegistry: CodeRegistry): void {
    this.changeLocation(codeRegistry.location);
  }

  atRegistryCreatePage(): void {
    this.changeLocation([createRegistryPage]);
  }

  atCodeSchemePage(codeScheme: CodeScheme): void {
    this.changeLocation(codeScheme.location);
  }

  atCodePage(code: Code): void {
    this.changeLocation(code.location);
  }

  atExtensionPage(extensionScheme: ExtensionScheme): void {
    this.changeLocation(extensionScheme.location);
  }

  atMemberPage(member: Member): void {
    this.changeLocation(member.location);
  }

  atCodeSchemeImportAndCreatePage(): void {
    this.changeLocation([codeSchemeImportAndCreatePage]);
  }

  atCodeSchemeCreatePage(): void {
    this.changeLocation([createCodeSchemePage]);
  }

  atCreateNewVersionOfCodeSchemePage(codeScheme: CodeScheme): void {
    this.changeLocation([...codeScheme.location, createNewVersionOfCodeSchemePage]);
  }

  atCodeCreatePage(codeScheme: CodeScheme): void {
    this.changeLocation([...codeScheme.location, createCodePage]);
  }

  atExtensionCreatePage(codeScheme: CodeScheme, title: string): void {
    const createExtensionPage = { localizationKey: title, route: ['createextensionscheme'] };
    this.changeLocation([...codeScheme.location, createExtensionPage]);
  }

  atMemberCreatePage(extensionScheme: ExtensionScheme): void {
    this.changeLocation([...extensionScheme.location, createMemberPage]);
  }

  atInformationAboutService(): void {
    this.changeLocation([informationAboutServicePage]);
  }
}
