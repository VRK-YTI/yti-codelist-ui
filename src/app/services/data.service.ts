import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { CodeScheme } from '../model/codescheme';
import { CodeRegistry } from '../model/coderegistry';
import { Code } from '../model/code';

@Injectable()
export class DataService {

  public static readonly API_INTAKE_CONTEXT_PATH = 'codelist-intake';
  public static readonly API_CONTEXT_PATH = 'codelist-api';
  public static readonly API_BASE_PATH = 'api';
  public static readonly API_VERSION = 'v1';
  public static readonly API_PATH_CODEREGISTRIES = 'coderegistries';
  public static readonly API_PATH_CODESCHEMES = 'codeschemes';
  public static readonly API_PATH_CODES = 'codes';

  constructor(private http: Http) {
    console.log('DataService connected!');
  }

  getCodeRegistries() {
    return this.http.get(this.getCodeRegistriesBasePath())
      .map(res => res.json() as CodeRegistry);
  }

  getCodeRegistry(codeRegistryCodeValue: string) {
    return this.http.get(`${this.getCodeRegistriesBasePath()}/${codeRegistryCodeValue}/`)
      .map(res => res.json() as CodeRegistry);
  }

  getCodeSchemes(codeRegistryCodeValue: string) {
    return this.http.get(`${this.getCodeRegistriesBasePath()}/${codeRegistryCodeValue}/${DataService.API_PATH_CODESCHEMES}/`)
      .map(res => res.json() as CodeScheme);
  }

  getCodeScheme(codeRegistryCodeValue: string, codeSchemeCodeValue: string) {
    return this.http.get(`${this.getCodeRegistriesBasePath()}/${codeRegistryCodeValue}/${DataService.API_PATH_CODESCHEMES}/${codeSchemeCodeValue}/`)
      .map(res => res.json() as CodeScheme);
  }

  getCodes(codeRegistryCodeValue: string, codeSchemeCodeValue: string) {
    return this.http.get(`${this.getCodeRegistriesBasePath()}/${codeRegistryCodeValue}/${DataService.API_PATH_CODESCHEMES}/${codeSchemeCodeValue}/${DataService.API_PATH_CODES}/`)
      .map(res => res.json() as Code);
  }

  getCode(codeRegistryCodeValue: string, codeSchemeCodeValue: string, codeCodeValue: string) {
    return this.http.get(`${this.getCodeRegistriesBasePath()}/${codeRegistryCodeValue}/${DataService.API_PATH_CODESCHEMES}/${codeSchemeCodeValue}/${DataService.API_PATH_CODES}/${codeCodeValue}/`)
      .map(res => res.json() as Code);
  }

  getCodeRegistriesBasePath() {
    return `/${DataService.API_CONTEXT_PATH}/${DataService.API_BASE_PATH}/${DataService.API_VERSION}/${DataService.API_PATH_CODEREGISTRIES}`;
  }
}
