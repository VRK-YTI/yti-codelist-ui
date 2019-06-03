import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { ServiceConfiguration } from '../entities/service-configuration';

@Injectable({
  providedIn: 'root',
})
export class ConfigurationService {

  configuration: ServiceConfiguration;

  constructor(private dataService: DataService) {
  }

  fetchConfiguration(): Promise<ServiceConfiguration> {
    return this.dataService.getServiceConfiguration().toPromise().then(configuration => {
      this.configuration = configuration;
      return configuration;
    });
  }

  get loading(): boolean {

    return this.configuration == null;
  }

  get env(): string {

    return this.configuration.env;
  }

  get codeSchemeSortMode(): string | undefined {

    return this.configuration.codeSchemeSortMode;
  }

  get defaultStatus(): string | undefined {

    return this.configuration.defaultStatus;
  }

  get groupManagementUrl(): string {

    return this.configuration.groupManagementConfig.url;
  }

  get terminologyUrl(): string {

    return this.configuration.terminologyConfig.url;
  }

  get dataModelUrl(): string {

    return this.configuration.dataModelConfig.url;
  }

  getUriWithEnv(uri: string): string | null {

    if (uri && this.env !== 'prod') {
      return uri + '?env=' + this.env;
    }
    return uri ? uri : null;
  }

  get showUnfinishedFeature(): boolean {

    return this.env === 'dev' || this.env === 'awsdev' || this.env === 'local';
  }

  getEnvironmentIdentifier(style?: 'prefix' | 'postfix'): string {

    if (this.env && this.env !== 'prod') {
      let identifier;
      if (this.env === 'awsdev') {
        identifier = 'DEV';
      } else {
        identifier = this.env.toUpperCase();
      }
      if (!style) {
        return identifier;
      } else if (style === 'prefix') {
        return identifier + ' - ';
      } else if (style === 'postfix') {
        return ' - ' + identifier;
      }
    }
    return '';
  }
}
