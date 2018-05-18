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
  CodeSchemeType, CodePlainType,
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
import {Vocabulary} from '../entities/Vocabulary';
import { CodePlain } from '../entities/code-simple';
import {Concept} from '../entities/concept';

const intakeContext = 'codelist-intake';
const apiContext = 'codelist-api';
const api = 'api';
const terminologyContext = 'terminology';

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
const vocabularies = 'vocabularies';
const concepts = 'concepts';
const searchterm = 'searchterm';
const vocabulary = 'vocabulary';

const codeSchemesBasePath = `/${apiContext}/${api}/${version}/${codeSchemes}`;
const codeRegistriesBasePath = `/${apiContext}/${api}/${version}/${registries}`;
const configurationIntakeBasePath = `/${intakeContext}/${api}/${configuration}`;
const externalReferencesBasePath = `/${apiContext}/${api}/${version}/${externalReferences}`;
const codeRegistriesIntakeBasePath = `/${intakeContext}/${api}/${version}/${registries}`;
const dataClassificationsBasePath = `/${intakeContext}/${api}/${version}/${classifications}`;
const propertyTypesBasePath = `/${apiContext}/${api}/${version}/${propertytypes}`;
const organizationsBasePath = `/${intakeContext}/${api}/${version}/${organizations}`;
const fakeableUsersPath = `/${intakeContext}/${api}/${fakeableUsers}`;
const groupManagementRequestBasePath = `/${intakeContext}/${api}/${version}/${groupmanagement}/${request}`;
const groupManagementRequestsBasePath = `/${intakeContext}/${api}/${version}/${groupmanagement}/${requests}`;
const terminologyBasePath = `/${intakeContext}/${api}/${version}/${terminologyContext}`;
const terminologyVocabulariesPath = `${terminologyBasePath}/${vocabularies}`;
const terminologyConceptsPath = `${terminologyBasePath}/${concepts}`;

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
    const params = new URLSearchParams();
    params.append('expand', 'organization');

    return this.http.get(codeRegistriesBasePath, {params})
      .map(res => res.json().results.map((data: CodeRegistryType) => new CodeRegistry(data)));
  }

  getCodeRegistriesForUser(): Observable<CodeRegistry[]> {
    return this.getCodeRegistries().map(r => this.authorizationManager.filterAllowedRegistriesForUser(r));
  }

  getOrganizations(): Observable<Organization[]> {
    return this.http.get(organizationsBasePath)
      .map(res => res.json().results.map((data: OrganizationType) => new Organization(data)));
  }

  getCodeRegistry(coderegistryCode: string): Observable<CodeRegistry> {
    const params = new URLSearchParams();
    params.append('expand', 'organization');

    return this.http.get(`${codeRegistriesBasePath}/${coderegistryCode}/`, {params})
      .map(res => new CodeRegistry(res.json() as CodeRegistryType));
  }

  searchCodeSchemes(searchTerm: string, classification: string | null, organization: string | null,
                    sortMode: string | null, searchCodes: boolean | false, language: string | null): Observable<CodeScheme[]> {

    const params = new URLSearchParams();
    params.append('expand', 'codeRegistry,externalReference,propertyType,code,organization');
    params.append('searchCodes', searchCodes.toString());

    if (language) {
      params.append('language', language);
    }

    if (sortMode) {
      params.append('sortMode', sortMode);
    }

    if (searchTerm) {
      params.append('searchTerm', searchTerm);
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

  getPlainCodes(registryCode: string, schemeCode: string): Observable<CodePlain[]> {

    return this.http.get(`${codeRegistriesBasePath}/${registryCode}/${codeSchemes}/${schemeCode}/${codes}/`)
      .map(res => res.json().results.map((data: CodePlainType) => new CodePlain(data)));
  }

  getCodes(registryCode: string, schemeCode: string): Observable<Code[]> {

    const params = new URLSearchParams();
    params.append('expand', 'codeScheme,codeRegistry,externalReference,propertyType');

    return this.http.get(`${codeRegistriesBasePath}/${registryCode}/${codeSchemes}/${schemeCode}/${codes}/`, {params})
      .map(res => res.json().results.map((data: CodeType) => new Code(data)));
  }

  getCode(registryCode: string, schemeCode: string, codeCodeValue: string): Observable<Code> {

    const params = new URLSearchParams();
    params.append('expand', 'codeScheme,codeRegistry,externalReference,propertyType,organization');

    return this.http.get(`${codeRegistriesBasePath}/${registryCode}/${codeSchemes}/${schemeCode}/${codes}/${codeCodeValue}/`, {params})
      .map(res => new Code(res.json() as CodeType));
  }

  createCode(code: CodeType, registryCode: string, schemeCode: string): Observable<Code> {
    return this.createCodes([code], registryCode, schemeCode).map(createdCodes => {
      if (createdCodes.length !== 1) {
        throw new Error('Exactly one code needs to be created');
      } else {
        return createdCodes[0];
      }
    });
  }

  createCodes(codeList: CodeType[], registryCode: string, schemeCode: string): Observable<Code[]> {

    return this.http.post(`${codeRegistriesIntakeBasePath}/${registryCode}/${codeSchemes}/${schemeCode}/${codes}/`,
      codeList)
      .map(res => res.json().results.map((data: CodeType) => new Code(data)));
  }

  saveCode(code: CodeType): Observable<ApiResponseType> {

    const registryCode = code.codeScheme.codeRegistry.codeValue;
    const schemeCode = code.codeScheme.codeValue;

    return this.http.post(`${codeRegistriesIntakeBasePath}/${registryCode}/${codeSchemes}/${schemeCode}/${codes}/${code.codeValue}/`, code)
      .map(res => res.json() as ApiResponseType);
  }

  deleteCode(code: Code): Observable<boolean> {

    const registryCode = code.codeScheme.codeRegistry.codeValue;
    const schemeCode = code.codeScheme.codeValue;

    return this.http.delete(`${codeRegistriesIntakeBasePath}/${registryCode}/${codeSchemes}/${schemeCode}/${codes}/${code.codeValue}/`)
      .map(res => {
        return res.status === 200;
      }).catch(error => {
        return Observable.of(false);
      });
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

    console.log('saving codescheme in dataservice');
    console.log(codeScheme);
    const registryCode = codeScheme.codeRegistry.codeValue;

    return this.http.post(`${codeRegistriesIntakeBasePath}/${registryCode}/${codeSchemes}/${codeScheme.codeValue}/`, codeScheme)
      .map(res => res.json() as ApiResponseType);
  }

  deleteCodeScheme(codeScheme: CodeScheme): Observable<boolean> {

    const registryCode = codeScheme.codeRegistry.codeValue;

    return this.http.delete(`${codeRegistriesIntakeBasePath}/${registryCode}/${codeSchemes}/${codeScheme.codeValue}/`)
      .map(res => {
        return res.status === 200;
      }).catch(error => {
        return Observable.of(false);
      });
  }

  uploadCodeSchemes(registryCode: string, file: File, format: string): Observable<CodeScheme[]> {

    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    const params = new URLSearchParams();
    params.append('format', format);

    return this.http.post(`${codeRegistriesIntakeBasePath}/${registryCode}/${codeSchemes}/`, formData, {params})
      .map(res => res.json().results.map((data: CodeSchemeType) => new CodeScheme(data)));
  }

  uploadCodes(registryCode: string, codeschemeCode: string, file: File, format: string): Observable<CodeScheme[]> {

    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    const params = new URLSearchParams();
    params.append('format', format);

    return this.http.post(`${codeRegistriesIntakeBasePath}/${registryCode}/${codeSchemes}/${codeschemeCode}/${codes}`, formData, {params})
      .map(res => res.json().results.map((data: CodeType) => new Code(data)));
  }

  getServiceConfiguration(): Observable<ServiceConfiguration> {
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

  getVocabularies(): Observable<Vocabulary[]> {
    return this.http.get(`${terminologyVocabulariesPath}/`, undefined)
      .map(response => response.json().results as Vocabulary[]);
  }

  getConcepts(searchTerm: string, vocab: string | null): Observable<Concept[]> {
    const encodedSearchTerm = encodeURIComponent(searchTerm);
    return this.http.get(`${terminologyConceptsPath}/${searchterm}/${encodedSearchTerm}/${vocabulary}/${vocab}` , undefined )
      .map(response => response.json().results as Concept[]);
  }

  codeSchemeCodeValueExists(registryCode: string, schemeCode: string): Observable<boolean> {

    return this.http.head(`${codeRegistriesIntakeBasePath}/${registryCode}/${codeSchemes}/${schemeCode}`)
      .map(res => {
        return res.status === 200;
      }).catch(error => {
        return Observable.of(false);
      });
  }

  codeCodeValueExists(registryCode: string, schemeCode: string, code: string): Observable<boolean> {

    return this.http.head(`${codeRegistriesIntakeBasePath}/${registryCode}/${codeSchemes}/${schemeCode}/${codes}/${code}`)
      .map(res => {
        return res.status === 200;
      }).catch(error => {
        return Observable.of(false);
      });
  }
}
