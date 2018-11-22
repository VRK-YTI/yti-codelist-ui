import { Injectable, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { CodeScheme } from '../entities/code-scheme';
import { Code } from '../entities/code';
import { Location } from 'yti-common-ui/types/location';
import { Extension } from '../entities/extension';
import { Member } from '../entities/member';
import { CodeRegistry } from '../entities/code-registry';
import { TranslateService } from '@ngx-translate/core';
import { ConfigurationService } from './configuration.service';
import { Title } from '@angular/platform-browser';

const frontPage = { localizationKey: 'Front page', route: [''] };
const informationAboutServicePage = { localizationKey: 'Information about the service', route: ['information'] };
const codeSchemeImportAndCreatePage = { localizationKey: 'Add code list', route: ['importandcreatecodescheme'] };
const createNewVersionOfCodeSchemePage = { localizationKey: 'Create a new version', route: ['createcodescheme'] };
const createCodeSchemePage = { localizationKey: 'Create code list', route: ['createcodescheme'] };
const createCodePage = { localizationKey: 'Create code', route: ['createcode'] };
const createMemberPage = { localizationKey: 'Create member', route: ['createmember'] };
const createRegistryPage = { localizationKey: 'Create registry', route: ['createregistry'] };

@Injectable()
export class LocationService implements OnDestroy {

  private titleTranslationSubscription: Subscription;

  constructor(private translateService: TranslateService,
              private configurationService: ConfigurationService,
              private titleService: Title) {
    this.titleTranslationSubscription = this.translateService.stream('Reference Data').subscribe(value => {
      this.titleService.setTitle(this.configurationService.getEnvironmentIdentifier('prefix') + value);
    });
  }

  ngOnDestroy() {
    this.titleTranslationSubscription.unsubscribe();
  }

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

  atExtensionPage(extension: Extension): void {
    this.changeLocation(extension.location);
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
    const createExtensionPage = { localizationKey: title, route: ['createextension'] };
    this.changeLocation([...codeScheme.location, createExtensionPage]);
  }

  atMemberCreatePage(extension: Extension): void {
    this.changeLocation([...extension.location, createMemberPage]);
  }

  atInformationAboutService(): void {
    this.changeLocation([informationAboutServicePage]);
  }
}
