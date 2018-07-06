import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { CodeScheme } from '../entities/code-scheme';
import { Code } from '../entities/code';
import { Location } from 'yti-common-ui/types/location';
import { ExtensionScheme } from '../entities/extension-scheme';
import { Extension } from '../entities/extension';
import { CodeRegistry } from '../entities/code-registry';

const frontPage = { localizationKey: 'Front page', route: [''] };
const informationAboutServicePage = { localizationKey: 'Information about the service', route: ['information'] };
const codeSchemeImportAndCreatePage = { localizationKey: 'Add code list', route: ['importandcreatecodescheme'] };
const copyCodeSchemePage = { localizationKey: 'Copy the code list', route: ['createcodescheme'] };
const createCodeSchemePage = { localizationKey: 'Create code list', route: ['createcodescheme'] };
const createCodePage = { localizationKey: 'Create code', route: ['createcode'] };
const createExtensionSchemePage = { localizationKey: 'Create extension scheme', route: ['createextensionscheme'] };
const createExtensionPage = { localizationKey: 'Create extension', route: ['createextension'] };
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

  atExtensionSchemePage(extensionScheme: ExtensionScheme): void {
    this.changeLocation(extensionScheme.location);
  }

  atExtensionPage(extension: Extension): void {
    this.changeLocation(extension.location);
  }

  atCodeSchemeImportAndCreatePage(): void {
    this.changeLocation([codeSchemeImportAndCreatePage]);
  }

  atCodeSchemeCreatePage(): void {
    this.changeLocation([createCodeSchemePage]);
  }

  atCodeSchemeCopyPage(codeScheme: CodeScheme): void {
    this.changeLocation([...codeScheme.location, copyCodeSchemePage]);
  }

  atCodeCreatePage(codeScheme: CodeScheme): void {
    this.changeLocation([...codeScheme.location, createCodePage]);
  }

  atExtensionSchemeCreatePage(codeScheme: CodeScheme): void {
    this.changeLocation([...codeScheme.location, createExtensionSchemePage]);
  }

  atExtensionCreatePage(extensionScheme: ExtensionScheme): void {
    this.changeLocation([...extensionScheme.location, createExtensionPage]);
  }

  atInformationAboutService(): void {
    this.changeLocation([informationAboutServicePage]);
  }
}
