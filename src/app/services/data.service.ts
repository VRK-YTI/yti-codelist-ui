import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { CodeScheme } from '../model/codescheme';
import { CodeRegistry } from '../model/coderegistry';
import { Code } from '../model/code';
import { Observable } from 'rxjs/Observable';
import { ApiResponse } from '../model/apiresponse';
import { DataClassification } from '../model/dataclassification';

@Injectable()
export class DataService {

  public static readonly API_INTAKE_CONTEXT_PATH = 'codelist-intake';
  public static readonly API_CONTEXT_PATH = 'codelist-api';
  public static readonly API_BASE_PATH = 'api';
  public static readonly API_VERSION = 'v1';
  public static readonly API_PATH_CODEREGISTRIES = 'coderegistries';
  public static readonly API_PATH_CODESCHEMES = 'codeschemes';
  public static readonly API_PATH_CODES = 'codes';
  public static readonly API_PATH_DATACLASSIFICATIONS = 'dataclassifications';

  constructor(private http: Http) {
    console.log('DataService connected!');
  }

  getCodeRegistries(): Observable<CodeRegistry[]> {
    return this.http.get(this.getCodeRegistriesBasePath())
      .map(res => res.json().results as CodeRegistry[]);
  }

  getCodeRegistry(codeRegistryCodeValue: string): Observable<CodeRegistry> {
    return this.http.get(`${this.getCodeRegistriesBasePath()}/${codeRegistryCodeValue}/`)
      .map(res => res.json() as CodeRegistry);
  }

  getCodeSchemes(): Observable<CodeScheme[]> {
    return this.http.get(`${this.getCodeSchemesBasePath()}/?expand=codeRegistry`)
      .map(res => res.json().results as CodeScheme[]);
  }

  getCodeSchemesWithTerm(searchTerm: string): Observable<CodeScheme[]> {
    return this.http.get(`${this.getCodeSchemesBasePath()}/?expand=codeRegistry&prefLabel=${searchTerm}`)
      .map(res => res.json().results as CodeScheme[]);
  }

  getDataClassifications(): Observable<DataClassification[]> {
    return this.http.get(`${this.getDataClassificationsBasePath()}/`)
      .map(res => res.json().results as DataClassification[]);
  }

  getCodeSchemesWithClassification(dataClassification: string): Observable<CodeScheme[]> {
    return this.http.get(`${this.getCodeSchemesBasePath()}/?expand=codeRegistry&dataClassification=${dataClassification}`)
      .map(res => res.json().results as CodeScheme[]);
  }

  getCodeSchemesForRegistry(codeRegistryCodeValue: string): Observable<CodeScheme[]> {
    return this.http.get(`${this.getCodeRegistriesBasePath()}/${codeRegistryCodeValue}/${DataService.API_PATH_CODESCHEMES}/?expand=codeRegistry`)
      .map(res => res.json().results as CodeScheme[]);
  }

  getCodeScheme(codeRegistryCodeValue: string, codeSchemeCodeValue: string): Observable<CodeScheme> {
    return this.http.get(`${this.getCodeRegistriesBasePath()}/${codeRegistryCodeValue}/${DataService.API_PATH_CODESCHEMES}/${codeSchemeCodeValue}/?expand=codeRegistry,code`)
      .map(res => res.json() as CodeScheme);
  }

  getCodes(codeRegistryCodeValue: string, codeSchemeCodeValue: string): Observable<Code[]> {
    return this.http.get(`${this.getCodeRegistriesBasePath()}/${codeRegistryCodeValue}/${DataService.API_PATH_CODESCHEMES}/${codeSchemeCodeValue}/${DataService.API_PATH_CODES}/?expand=codeScheme,codeRegistry`)
      .map(res => res.json().results as Code[]);
  }

  getCode(codeRegistryCodeValue: string, codeSchemeCodeValue: string, codeId: string): Observable<Code> {
    return this.http.get(`${this.getCodeRegistriesBasePath()}/${codeRegistryCodeValue}/${DataService.API_PATH_CODESCHEMES}/${codeSchemeCodeValue}/${DataService.API_PATH_CODES}/${codeId}/?expand=codeScheme,codeRegistry`)
      .map(res => res.json() as Code);
  }

  saveCode(code: Code): Observable<ApiResponse> {
    return this.http.post(`${this.getCodeRegistriesIntakeBasePath()}/${code.codeScheme.codeRegistry.codeValue}/${DataService.API_PATH_CODESCHEMES}/${code.codeScheme.codeValue}/${DataService.API_PATH_CODES}/${code.id}/`, code)
      .map(res => res.json() as ApiResponse);
  }

  saveCodeScheme(codeScheme: CodeScheme): Observable<ApiResponse> {
    return this.http.post(`${this.getCodeRegistriesIntakeBasePath()}/${codeScheme.codeRegistry.codeValue}/${DataService.API_PATH_CODESCHEMES}/${codeScheme.id}/`, codeScheme)
      .map(res => res.json() as ApiResponse);
  }

  getCodeSchemesBasePath() {
    return `/${DataService.API_CONTEXT_PATH}/${DataService.API_BASE_PATH}/${DataService.API_VERSION}/${DataService.API_PATH_CODESCHEMES}`;
  }

  getCodeRegistriesBasePath() {
    return `/${DataService.API_CONTEXT_PATH}/${DataService.API_BASE_PATH}/${DataService.API_VERSION}/${DataService.API_PATH_CODEREGISTRIES}`;
  }

  getCodeRegistriesIntakeBasePath() {
    return `/${DataService.API_INTAKE_CONTEXT_PATH}/${DataService.API_BASE_PATH}/${DataService.API_VERSION}/${DataService.API_PATH_CODEREGISTRIES}`;
  }

  getDataClassificationsBasePath() {
    return `/${DataService.API_INTAKE_CONTEXT_PATH}/${DataService.API_BASE_PATH}/${DataService.API_VERSION}/${DataService.API_PATH_DATACLASSIFICATIONS}`;
  }
}
