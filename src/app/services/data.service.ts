import { Injectable } from '@angular/core';
import { Http, URLSearchParams } from '@angular/http';
import { CodeScheme } from '../entities/code-scheme';
import { CodeRegistry } from '../entities/code-registry';
import { Observable } from 'rxjs/Observable';
import { DataClassification } from '../entities/data-classification';
import { Code } from '../entities/code';
import {
  ApiResponseType,
  CodeRegistryType,
  CodeSchemeType,
  CodeType,
  DataClassificationType,
  ExternalReferenceType,
  OrganizationType,
  PropertyTypeType
} from './api-schema';
import { PropertyType } from '../entities/property-type';
import { ExternalReference } from '../entities/external-reference';
import { Organization } from '../entities/organization';
import { ServiceConfiguration } from '../entities/service-configuration';
import { UserRequest } from '../entities/user-request';
import { AuthorizationManager } from './authorization-manager.service';

const intakeContext = 'codelist-intake';
const apiContext = 'codelist-api';
const api = 'api';

const version = 'v1';
const registries = 'coderegistries';
const configuration = 'configuration';
const codeSchemes = 'codeschemes';
const codes = 'codes';
const externalReferences = 'externalreferences';
const classifications = 'dataclassifications';
const propertytypes = 'propertytypes';
const organizations = 'organizations';
const fakeableUsers = 'fakeableUsers';
const groupmanagement = 'groupmanagement';
const requests = 'requests';
const request = 'request';

const codeSchemesBasePath = `/${apiContext}/${api}/${version}/${codeSchemes}`;
const codeRegistriesBasePath = `/${apiContext}/${api}/${version}/${registries}`;
const configurationIntakeBasePath = `/${intakeContext}/${api}/${version}/${configuration}`;
const externalReferencesBasePath = `/${apiContext}/${api}/${version}/${externalReferences}`;
const codeRegistriesIntakeBasePath = `/${intakeContext}/${api}/${version}/${registries}`;
const dataClassificationsBasePath = `/${intakeContext}/${api}/${version}/${classifications}`;
const propertyTypesBasePath = `/${apiContext}/${api}/${version}/${propertytypes}`;
const organizationsBasePath = `/${intakeContext}/${api}/${version}/${organizations}`;
const fakeableUsersPath = `/${intakeContext}/${api}/${fakeableUsers}`;
const groupManagementRequestBasePath = `/${intakeContext}/${api}/${version}/${groupmanagement}/${request}`;
const groupManagementRequestsBasePath = `/${intakeContext}/${api}/${version}/${groupmanagement}/${requests}`;

@Injectable()
export class DataService {

  constructor(private http: Http,
              private authorizationManager: AuthorizationManager) {
  }

  getFakeableUsers(): Observable<{ email: string, firstName: string, lastName: string }[]> {
    return this.http.get(fakeableUsersPath)
      .map(response => response.json());
  }

  getCodeRegistries(): Observable<CodeRegistry[]> {
    return this.http.get(codeRegistriesBasePath)
      .map(res => res.json().results.map((data: CodeRegistryType) => new CodeRegistry(data)));
  }

  getCodeRegistriesForUser(): Observable<CodeRegistry[]> {
    return this.getCodeRegistries().map(r => this.authorizationManager.filterAllowedRegistriesForUser(r));
  }

  getOrganizations(): Observable<Organization[]> {
    return this.http.get(organizationsBasePath)
      .map(res => res.json().results.map((data: OrganizationType) => new Organization(data)));
  }

  getCodeRegistry(codeRegistryCodeValue: string): Observable<CodeRegistry> {
    return this.http.get(`${codeRegistriesBasePath}/${codeRegistryCodeValue}/`)
      .map(res => new CodeRegistry(res.json() as CodeRegistryType));
  }

  searchCodeSchemes(searchTerm: string, classification: string | null, organization: string | null): Observable<CodeScheme[]> {

    const params = new URLSearchParams();
    params.append('expand', 'codeRegistry,externalReference,propertyType,code,organization');

    if (searchTerm) {
      params.append('prefLabel', searchTerm);
    }

    if (classification) {
      params.append('dataClassification', classification);
    }

    if (organization) {
      params.append('organizationId', organization);
    }

    return this.http.get(`${codeSchemesBasePath}`, {params})
      .map(res => res.json().results.map((data: CodeSchemeType) => new CodeScheme(data)));
  }

  getPropertyTypes(context: string): Observable<PropertyType[]> {

    const params = new URLSearchParams();
    params.append('context', context);

    return this.http.get(`${propertyTypesBasePath}/`, {params})
      .map(res => res.json().results.map((data: PropertyTypeType) => new PropertyType(data)));
  }

  getDataClassifications(): Observable<DataClassification[]> {
    return this.http.get(`${dataClassificationsBasePath}/`)
      .map(res => res.json().results.map((data: DataClassificationType) => new DataClassification(data)));
  }

  getDataClassificationsAsCodes(): Observable<Code[]> {
    const params = new URLSearchParams();
    params.append('expand', 'codeScheme,codeRegistry,externalReference,propertyType');
    params.append('hierarchyLevel', '1');

    return this.http.get(`${codeRegistriesBasePath}/jupo/${codeSchemes}/serviceclassification/${codes}/`, {params})
      .map(res => res.json().results.map((data: CodeType) => new Code(data)));
  }

  getCodeScheme(registryCode: string, schemeCode: string): Observable<CodeScheme> {

    const params = new URLSearchParams();
    params.append('expand', 'codeRegistry,organization,code,externalReference,propertyType,codeScheme,code');

    return this.http.get(`${codeRegistriesBasePath}/${registryCode}/${codeSchemes}/${schemeCode}/`, {params})
      .map(res => new CodeScheme(res.json() as CodeSchemeType));
  }

  getExternalReferences(codeSchemeId: string): Observable<ExternalReference[]> {

    const params = new URLSearchParams();
    params.append('codeSchemeId', codeSchemeId);
    params.append('expand', 'propertyType');

    return this.http.get(`${externalReferencesBasePath}/`, {params})
      .map(res => res.json().results.map((data: ExternalReferenceType) => new ExternalReference(data)));
  }

  getCodes(registryCode: string, schemeId: string): Observable<Code[]> {

    const params = new URLSearchParams();
    params.append('expand', 'codeScheme,codeRegistry,externalReference,propertyType');

    return this.http.get(`${codeRegistriesBasePath}/${registryCode}/${codeSchemes}/${schemeId}/${codes}/`, {params})
      .map(res => res.json().results.map((data: CodeType) => new Code(data)));
  }

  getCode(registryCode: string, schemeId: string, codeId: string): Observable<Code> {

    const params = new URLSearchParams();
    params.append('expand', 'codeScheme,codeRegistry,externalReference,propertyType,organization');

    return this.http.get(`${codeRegistriesBasePath}/${registryCode}/${codeSchemes}/${schemeId}/${codes}/${codeId}/`, {params})
      .map(res => new Code(res.json() as CodeType));
  }

  createCode(code: CodeType, registryCode: string, schemeId: string): Observable<Code> {
    return this.createCodes([code], registryCode, schemeId).map(createdCodes => {
      if (createdCodes.length !== 1) {
        throw new Error('Exactly one code needs to be created');
      } else {
        return createdCodes[0];
      }
    });
  }

  createCodes(codeList: CodeType[], registryCode: string, schemeId: string): Observable<Code[]> {

    return this.http.post(`${codeRegistriesIntakeBasePath}/${registryCode}/${codeSchemes}/${schemeId}/${codes}/`,
      codeList)
      .map(res => res.json().results.map((data: CodeType) => new Code(data)));
  }

  saveCode(code: CodeType): Observable<ApiResponseType> {

    const registryCode = code.codeScheme.codeRegistry.codeValue;
    const schemeId = code.codeScheme.id;

    return this.http.post(`${codeRegistriesIntakeBasePath}/${registryCode}/${codeSchemes}/${schemeId}/${codes}/${code.id}/`, code)
      .map(res => res.json() as ApiResponseType);
  }

  createCodeScheme(codeScheme: CodeSchemeType, registryCode: string): Observable<CodeScheme> {
    return this.createCodeSchemes([codeScheme], registryCode).map(createdCodeSchemes => {
      if (createdCodeSchemes.length !== 1) {
        throw new Error('Exactly one code scheme needs to be created');
      } else {
        return createdCodeSchemes[0];
      }
    });
  }

  createCodeSchemes(codeSchemeList: CodeSchemeType[], registryCode: string): Observable<CodeScheme[]> {

    return this.http.post(`${codeRegistriesIntakeBasePath}/${registryCode}/${codeSchemes}/`,
      codeSchemeList)
      .map(res => res.json().results.map((data: CodeSchemeType) => new CodeScheme(data)));
  }

  saveCodeScheme(codeScheme: CodeSchemeType): Observable<ApiResponseType> {

    const registryCode = codeScheme.codeRegistry.codeValue;

    return this.http.post(`${codeRegistriesIntakeBasePath}/${registryCode}/${codeSchemes}/${codeScheme.id}/`, codeScheme)
      .map(res => res.json() as ApiResponseType);
  }

  uploadCodeSchemes(registryCode: string, file: File, format: string): Observable<CodeScheme[]> {

    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    const params = new URLSearchParams();
    params.append('format', format);

    return this.http.post(`${codeRegistriesIntakeBasePath}/${registryCode}/${codeSchemes}/`, formData, {params})
      .map(res => res.json().results.map((data: CodeSchemeType) => new CodeScheme(data)));
  }

  uploadCodes(registryCode: string, codeSchemeId: string, file: File, format: string): Observable<CodeScheme[]> {

    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    const params = new URLSearchParams();
    params.append('format', format);

    return this.http.post(`${codeRegistriesIntakeBasePath}/${registryCode}/${codeSchemes}/${codeSchemeId}/${codes}`, formData, {params})
      .map(res => res.json().results.map((data: CodeType) => new Code(data)));
  }

  getServiceConfiguration() {
    return this.http.get(`${configurationIntakeBasePath}`)
      .map(res => res.json() as ServiceConfiguration);
  }

  getUserRequests(): Observable<UserRequest[]> {
    return this.http.get(`${groupManagementRequestsBasePath}/`, undefined)
      .map(response => response.json().results as UserRequest[]);
  }

  sendUserRequest(organizationId: string): Observable<any> {
    return this.http.post(`${groupManagementRequestBasePath}/?organizationId=${organizationId}`, null, undefined);
  }
}
