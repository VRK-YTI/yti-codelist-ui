import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class DataService {

  public static readonly API_HOST = 'http://localhost:9600/';
  public static readonly API_BASE_PATH = 'api/v1/';
  public static readonly API_PATH_CODEREGISTRIES = 'coderegistries/';
  public static readonly API_PATH_CODESCHEMES = 'codeschemes/';
  public static readonly API_PATH_CODES = 'codes/';

  constructor(private http: Http) {
    console.log('DataService connected!');
  }

  getCodeRegistries() {
    return this.http.get(this.getCodeRegistriesBasePath())
      .map(res => res.json());
  }

  getCodeRegistry(codeRegistryCodeValue: string) {
    return this.http.get(this.getCodeRegistriesBasePath() + codeRegistryCodeValue + '/')
      .map(res => res.json());
  }

  getCodeSchemes(codeRegistryCodeValue: string) {
    return this.http.get(this.getCodeRegistriesBasePath() + codeRegistryCodeValue + '/' + DataService.API_PATH_CODESCHEMES)
      .map(res => res.json());
  }

  getCodeScheme(codeRegistryCodeValue: string, codeSchemeCodeValue: string) {
    return this.http.get(      this.getCodeRegistriesBasePath() + codeRegistryCodeValue + '/'
      + DataService.API_PATH_CODESCHEMES + codeSchemeCodeValue + '/')
      .map(res => res.json());
  }

  getCodes(codeRegistryCodeValue: string, codeSchemeCodeValue: string) {
    return this.http.get(this.getCodeRegistriesBasePath() + codeRegistryCodeValue + '/'
      + DataService.API_PATH_CODESCHEMES + codeSchemeCodeValue + '/' + DataService.API_PATH_CODES)
      .map(res => res.json());
  }

  getCode(codeRegistryCodeValue: string, codeSchemeCodeValue: string, codeCodeValue: string) {
    return this.http.get(this.getCodeRegistriesBasePath() + codeRegistryCodeValue + '/'
      + DataService.API_PATH_CODESCHEMES + codeSchemeCodeValue + '/' + DataService.API_PATH_CODES + codeCodeValue + '/')
      .map(res => res.json());
  }

  getCodeRegistriesBasePath() {
    return DataService.API_HOST + DataService.API_BASE_PATH + DataService.API_PATH_CODEREGISTRIES;
  }

}
