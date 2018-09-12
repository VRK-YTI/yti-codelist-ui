import { Injectable } from '@angular/core';
import { CodeScheme } from '../entities/code-scheme';
import { CodeRegistry } from '../entities/code-registry';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DataClassification } from '../entities/data-classification';
import { Code } from '../entities/code';
import {
  ApiResponseType,
  CodePlainType,
  CodeRegistryType,
  CodeSchemeType,
  CodeType,
  ConceptType,
  DataClassificationType,
  ExtensionSchemeType,
  ExtensionType,
  ExternalReferenceType,
  OrganizationType,
  PropertyTypeType,
  VocabularyType
} from './api-schema';
import { PropertyType } from '../entities/property-type';
import { ExternalReference } from '../entities/external-reference';
import { Organization } from '../entities/organization';
import { ServiceConfiguration } from '../entities/service-configuration';
import { UserRequest } from '../entities/user-request';
import { AuthorizationManager } from './authorization-manager.service';
import { Vocabulary } from '../entities/vocabulary';
import { CodePlain } from '../entities/code-simple';
import { Concept } from '../entities/concept';
import { ExtensionScheme } from '../entities/extension-scheme';
import { Extension } from '../entities/extension';
import { HttpClient, HttpParams } from '@angular/common/http';

const intakeContext = 'codelist-intake';
const apiContext = 'codelist-api';
const api = 'api';
const terminologyContext = 'terminology';

const version = 'v1';
const registries = 'coderegistries';
const configuration = 'configuration';
const codeSchemes = 'codeschemes';
const codeScheme = 'codescheme';
const codes = 'codes';
const externalReferences = 'externalreferences';
const classifications = 'dataclassifications';
const propertytypes = 'propertytypes';
const extensionSchemes = 'extensionschemes';
const extensions = 'extensions';
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
const extensionsBasePath = `/${apiContext}/${api}/${version}/${extensions}`;
const extensionsIntakeBasePath = `/${intakeContext}/${api}/${version}/${extensions}`;
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

interface FakeableUser {
  email: string;
  firstName: string;
  lastName: string;
}

interface WithResults<T> {
  results: T[];
}

@Injectable()
export class DataService {

  constructor(private http: HttpClient,
              private authorizationManager: AuthorizationManager) {
  }

  getFakeableUsers(): Observable<FakeableUser[]> {
    return this.http.get<FakeableUser[]>(fakeableUsersPath);
  }

  getCodeRegistries(): Observable<CodeRegistry[]> {

    const params = {
      expand: 'organization'
    };

    return this.http.get<WithResults<CodeRegistryType>>(codeRegistriesBasePath, {params})
      .pipe(map(res => res.results.map(data => new CodeRegistry(data))));
  }

  getCodeRegistriesForUser(): Observable<CodeRegistry[]> {
    return this.getCodeRegistries().pipe(map(r => this.authorizationManager.filterAllowedRegistriesForUser(r)));
  }

  getOrganizations(): Observable<Organization[]> {
    return this.http.get<WithResults<Organization>>(organizationsBasePath)
      .pipe(map(res => res.results.map(data => new Organization(data))));
  }

  getCodeRegistry(coderegistryCode: string): Observable<CodeRegistry> {

    const params = {
      expand: 'organization'
    };

    return this.http.get<CodeRegistryType>(`${codeRegistriesBasePath}/${coderegistryCode}/`, {params})
      .pipe(map(res => new CodeRegistry(res)));
  }

  createRegistry(codeRegistryToSave: CodeRegistryType): Observable<CodeRegistry> {
    return this.createRegistries([codeRegistryToSave]).pipe(map(createdRegistries => {
      if (createdRegistries.length !== 1) {
        throw new Error('Exactly one registry needs to be created');
      } else {
        return createdRegistries[0];
      }
    }));
  }

  createRegistries(registryList: CodeRegistryType[]): Observable<CodeRegistry[]> {

    return this.http.post<WithResults<CodeRegistryType>>(`${codeRegistriesIntakeBasePath}/`, registryList)
      .pipe(map(res => res.results.map((data: CodeRegistryType) => new CodeRegistry(data))));
  }

  saveCodeRegistry(codeRegistryToSave: CodeRegistryType): Observable<ApiResponseType> {

    console.log('saving registry in dataservice');
    console.log(codeRegistryToSave);
    const registryCode = codeRegistryToSave.codeValue;

    return this.http.post<ApiResponseType>(`${codeRegistriesIntakeBasePath}/${registryCode}/`, codeRegistryToSave);
  }

  deleteCodeRegistry(theCodeRegistry: CodeRegistry): Observable<ApiResponseType> {

    const registryCode = theCodeRegistry.codeValue;

    return this.http.delete<ApiResponseType>(`${codeRegistriesIntakeBasePath}/${registryCode}`);
  }

  getCodeSchemesForCodeRegistry(registryCodeValue: string): Observable<CodeScheme[]> {

    let params = new HttpParams();
    params = params.append('expand', 'codeRegistry,externalReference,propertyType,code,organization,extensionScheme');
    const userOrganizations = Array.from(this.authorizationManager.user.getOrganizations(['ADMIN', 'CODE_LIST_EDITOR']));
    if (userOrganizations.length > 0) {
      params = params.append('userOrganizations', userOrganizations.join(','));
    }

    return this.http.get<WithResults<CodeSchemeType>>(`${codeRegistriesBasePath}/${registryCodeValue}/${codeSchemes}/`, {params})
      .pipe(map(res => res.results.map(data => new CodeScheme(data))));
  }

  searchCodeSchemes(searchTerm: string | null, classification: string | null, organization: string | null,
                    sortMode: string | null, searchCodes: boolean | false, language: string | null): Observable<CodeScheme[]> {

    let params = new HttpParams()
      .append('expand', 'codeRegistry,externalReference,propertyType,code,organization,extensionScheme')
      .append('searchCodes', searchCodes.toString());

    const userOrganizations = Array.from(this.authorizationManager.user.getOrganizations(['ADMIN', 'CODE_LIST_EDITOR']));
    if (userOrganizations.length > 0) {
      params = params.append('userOrganizations', userOrganizations.join(','));
    }

    if (language) {
      params = params.append('language', language);
    }

    if (sortMode) {
      params = params.append('sortMode', sortMode);
    }

    if (searchTerm) {
      params = params.append('searchTerm', searchTerm);
    }

    if (classification) {
      params = params.append('dataClassification', classification);
    }

    if (organization) {
      params = params.append('organizationId', organization);
    }

    return this.http.get<WithResults<CodeSchemeType>>(`${codeSchemesBasePath}`, {params})
      .pipe(map(res => res.results.map(data => new CodeScheme(data))));
  }

  getPropertyTypes(context: string): Observable<PropertyType[]> {

    const params = {
      context: context
    };

    return this.http.get<WithResults<PropertyTypeType>>(`${propertyTypesBasePath}/`, {params})
      .pipe(map(res => res.results.map(data => new PropertyType(data))));
  }

  getPropertyType(propertyTypeLocalName: string): Observable<PropertyType> {

    return this.http.get<PropertyTypeType>(`${propertyTypesBasePath}/${propertyTypeLocalName}`)
      .pipe(map(res => new PropertyType(res)));
  }

  getDataClassifications(language: string): Observable<DataClassification[]> {

    const params = {
      language: language
    };

    return this.http.get<WithResults<DataClassificationType>>(`${dataClassificationsBasePath}/`, {params})
      .pipe(map(res => res.results.map((data: DataClassificationType) => new DataClassification(data))));
  }

  getDataClassificationsAsCodes(language: string): Observable<Code[]> {

    let params = new HttpParams()
      .append('expand', 'codeScheme,codeRegistry,externalReference,propertyType')
      .append('hierarchyLevel', '1');

    if (language) {
      params = params.append('language', language);
    }

    return this.http.get<WithResults<CodeType>>(`${codeRegistriesBasePath}/jupo/${codeSchemes}/serviceclassification/${codes}/`, {params})
      .pipe(map(res => res.results.map(data => new Code(data))));
  }

  getCodeScheme(registryCodeValue: string, schemeCodeValue: string): Observable<CodeScheme> {

    const params = {
      'expand': 'codeRegistry,organization,code,externalReference,propertyType,codeScheme,code,extensionScheme'
    };

    return this.http.get<CodeSchemeType>(`${codeRegistriesBasePath}/${registryCodeValue}/${codeSchemes}/${schemeCodeValue}/`, {params})
      .pipe(map(res => new CodeScheme(res)));
  }

  getCodeSchemeWithUuid(codeSchemeUuid: string): Observable<CodeScheme> {

    const params = {
      'expand': 'codeRegistry,organization,code,externalReference,propertyType,codeScheme,code,extensionScheme'
    };

    return this.http.get<CodeSchemeType>(`${codeSchemesBasePath}/${codeSchemeUuid}`, {params})
      .pipe(map(res => new CodeScheme(res)));
  }

  getExternalReferences(codeSchemeId: string): Observable<ExternalReference[]> {

    const params = new HttpParams()
      .append('expand', 'propertyType');

    if (codeSchemeId) {
      params.append('codeSchemeId', codeSchemeId);
    }

    return this.http.get<WithResults<ExternalReferenceType>>(`${externalReferencesBasePath}/`, {params})
      .pipe(map(res => res.results.map(data => new ExternalReference(data))));
  }

  getPlainCodes(registryCodeValue: string, schemeCodeValue: string): Observable<CodePlain[]> {

    return this.http.get<WithResults<CodePlainType>>(`${codeRegistriesBasePath}/${registryCodeValue}/${codeSchemes}/${schemeCodeValue}/${codes}/`)
      .pipe(map(res => res.results.map(data => new CodePlain(data))));
  }

  getLanguageCodes(language: string): Observable<Code[]> {
    return this.getCodes('interoperabilityplatform', 'languagecodes', language);
  }

  getCodes(registryCodeValue: string, schemeCodeValue: string, language: string): Observable<Code[]> {

    let params = new HttpParams()
      .append('expand', 'codeScheme,codeRegistry,externalReference,propertyType');

    if (language) {
      params = params.append('language', language);
    }

    return this.http.get<WithResults<CodeType>>(`${codeRegistriesBasePath}/${registryCodeValue}/${codeSchemes}/${schemeCodeValue}/${codes}/`, {params})
      .pipe(map(res => res.results.map(data => new Code(data))));
  }

  getCode(registryCodeValue: string, schemeCodeValue: string, codeCodeValue: string): Observable<Code> {

    const params = {
      'expand': 'codeScheme,codeRegistry,externalReference,propertyType,organization'
    };

    const encodedCodeCodeValue = encodeURIComponent(codeCodeValue);

    return this.http.get<CodeType>(
      `${codeRegistriesBasePath}/${registryCodeValue}/${codeSchemes}/${schemeCodeValue}/${codes}/${encodedCodeCodeValue}/`,
      {params})
      .pipe(map(res => new Code(res)));
  }

  createCode(code: CodeType, registryCodeValue: string, schemeCodeValue: string): Observable<Code> {
    return this.createCodes([code], registryCodeValue, schemeCodeValue).pipe(map(createdCodes => {
      if (createdCodes.length !== 1) {
        throw new Error('Exactly one code needs to be created');
      } else {
        return createdCodes[0];
      }
    }));
  }

  createCodes(codeList: CodeType[], registryCodeValue: string, schemeCodeValue: string): Observable<Code[]> {

    return this.http.post<WithResults<CodeType>>(`${codeRegistriesIntakeBasePath}/${registryCodeValue}/${codeSchemes}/${schemeCodeValue}/${codes}/`,
      codeList)
      .pipe(map(res => res.results.map(data => new Code(data))));
  }

  saveCode(code: CodeType): Observable<ApiResponseType> {

    const registryCodeValue = code.codeScheme.codeRegistry.codeValue;
    const schemeCodeValue = code.codeScheme.codeValue;
    const encodedCodeCodeValue = encodeURIComponent(code.codeValue);

    return this.http.post<ApiResponseType>(
      `${codeRegistriesIntakeBasePath}/${registryCodeValue}/${codeSchemes}/${schemeCodeValue}/${codes}/${encodedCodeCodeValue}/`, code);
  }

  deleteCode(code: Code): Observable<ApiResponseType> {

    const registryCodeValue = code.codeScheme.codeRegistry.codeValue;
    const schemeCodeValue = code.codeScheme.codeValue;
    const encodedCodeCodeValue = encodeURIComponent(code.codeValue);

    return this.http.delete<ApiResponseType>(
      `${codeRegistriesIntakeBasePath}/${registryCodeValue}/${codeSchemes}/${schemeCodeValue}/${codes}/${encodedCodeCodeValue}/`);
  }

  createCodeScheme(codeSchemeToCreate: CodeSchemeType, registryCodeValue: string): Observable<CodeScheme> {
    return this.createCodeSchemes([codeSchemeToCreate], registryCodeValue).pipe(map(createdCodeSchemes => {
      if (createdCodeSchemes.length !== 1) {
        throw new Error('Exactly one code scheme needs to be created');
      } else {
        return createdCodeSchemes[0];
      }
    }));
  }

  cloneCodeScheme(codeSchemeToClone: CodeSchemeType, registryCodeValue: string, originalCodeSchemeUuid: string): Observable<CodeScheme[]> {
      return this.http.post<WithResults<CodeSchemeType>>(`${codeRegistriesIntakeBasePath}/${registryCodeValue}/clone/codescheme/${originalCodeSchemeUuid}`,
        codeSchemeToClone)
        .pipe(map(res => res.results.map((data: CodeSchemeType) => new CodeScheme(data))));
  }

  createCodeSchemes(codeSchemeList: CodeSchemeType[], registryCodeValue: string): Observable<CodeScheme[]> {

    return this.http.post<WithResults<CodeSchemeType>>(`${codeRegistriesIntakeBasePath}/${registryCodeValue}/${codeSchemes}/`,
      codeSchemeList)
      .pipe(map(res => res.results.map(data => new CodeScheme(data))));
  }

  saveCodeScheme(codeSchemeToSave: CodeSchemeType): Observable<ApiResponseType> {
    const registryCode = codeSchemeToSave.codeRegistry.codeValue;

    return this.http.post<ApiResponseType>(`${codeRegistriesIntakeBasePath}/${registryCode}/${codeSchemes}/${codeSchemeToSave.codeValue}/`, codeSchemeToSave);
  }

  deleteCodeScheme(theCodeScheme: CodeScheme): Observable<ApiResponseType> {

    const registryCode = theCodeScheme.codeRegistry.codeValue;

    return this.http.delete<ApiResponseType>(`${codeRegistriesIntakeBasePath}/${registryCode}/${codeSchemes}/${theCodeScheme.codeValue}/`);
  }

  uploadCodeSchemes(registryCode: string, file: File, format: string): Observable<CodeScheme[]> {

    const formData: FormData = new FormData();
    formData.append('file', file, file.name);

    const params = {
      'format': format
    };

    return this.http.post<WithResults<CodeSchemeType>>(`${codeRegistriesIntakeBasePath}/${registryCode}/${codeSchemes}/`, formData, {params})
      .pipe(map(res => res.results.map(data => new CodeScheme(data))));
  }

  uploadCodes(registryCodeValue: string, schemeCodeValue: string, file: File, format: string): Observable<Code[]> {

    const formData: FormData = new FormData();
    formData.append('file', file, file.name);

    const params = {
      'format': format
    };

    return this.http.post<WithResults<CodeType>>(`${codeRegistriesIntakeBasePath}/${registryCodeValue}/${codeSchemes}/${schemeCodeValue}/${codes}`,
      formData, {params})
      .pipe(map(res => res.results.map((data: CodeType) => new Code(data))));
  }

  getServiceConfiguration(): Observable<ServiceConfiguration> {
    return this.http.get<ServiceConfiguration>(`${configurationIntakeBasePath}`);
  }

  getUserRequests(): Observable<UserRequest[]> {
    return this.http.get<WithResults<UserRequest>>(`${groupManagementRequestsBasePath}/`)
      .pipe(map(response => response.results));
  }

  sendUserRequest(organizationId: string): Observable<any> {
    return this.http.post(`${groupManagementRequestBasePath}/?organizationId=${organizationId}`, null);
  }

  getVocabularies(): Observable<Vocabulary[]> {
    return this.http.get<WithResults<VocabularyType>>(`${terminologyVocabulariesPath}/`)
      .pipe(map(response => response.results.map((data: VocabularyType) => new Vocabulary(data))));
  }

  getConcepts(searchTerm: string, vocab: string | null): Observable<Concept[]> {

    const encodedSearchTerm = encodeURIComponent(searchTerm);

    return this.http.get<WithResults<ConceptType>>(`${terminologyConceptsPath}/${searchterm}/${encodedSearchTerm}/${vocabulary}/${vocab || '0'}`)
      .pipe(map(response => response.results.map((data: ConceptType) => new Concept(data))));
  }

  getExtensionScheme(registryCodeValue: string, schemeCodeValue: string, extensionSchemeCodeValue: string): Observable<ExtensionScheme> {

    const params = {
      'expand': 'codeRegistry,organization,code,externalReference,propertyType,codeScheme,code'
    };

    return this.http.get<ExtensionSchemeType>(
      `${codeRegistriesBasePath}/${registryCodeValue}/${codeSchemes}/${schemeCodeValue}/${extensionSchemes}/${extensionSchemeCodeValue}`,
      {params})
      .pipe(map(res => new ExtensionScheme(res)));
  }

  getExtensionSchemes(registryCodeValue: string, schemeCodeValue: string): Observable<ExtensionScheme[]> {

    const params = {
      'expand': 'codeScheme,codeRegistry,externalReference,propertyType'
    };

    return this.http.get<WithResults<ExtensionSchemeType>>(`${codeRegistriesBasePath}/${registryCodeValue}/${codeSchemes}/${schemeCodeValue}/${extensionSchemes}/`, {params})
      .pipe(map(res => res.results.map(data => new ExtensionScheme(data))));
  }

  getExtension(extensionId: string): Observable<Extension> {

    const params = {
      'expand': 'extensionScheme,codeRegistry,organization,code,externalReference,propertyType,codeScheme,code'
    };

    return this.http.get<ExtensionType>(
      `${extensionsBasePath}/${extensionId}`,
      {params})
      .pipe(map(res => new Extension(res)));
  }

  getExtensions(registryCodeValue: string, schemeCodeValue: string, extensionSchemeCodeValue: string): Observable<Extension[]> {

    const params = {
      'expand': 'extensionScheme,codeRegistry,organization,code,externalReference,propertyType,codeScheme,code'
    };

    return this.http.get<WithResults<ExtensionType>>(
      `${codeRegistriesBasePath}/${registryCodeValue}/${codeSchemes}/${schemeCodeValue}/${extensionSchemes}/` +
      `${extensionSchemeCodeValue}/${extensions}/`,
      {params})
      .pipe(map(res => res.results.map((data: ExtensionType) => new Extension(data))));
  }

  saveExtensionScheme(extensionSchemeToSave: ExtensionSchemeType): Observable<ApiResponseType> {

    console.log('Saving ExtensionScheme in dataservice');
    console.log(extensionSchemeToSave);
    const registryCodeValue = extensionSchemeToSave.parentCodeScheme.codeRegistry.codeValue;
    const codeSchemeCodeValue = extensionSchemeToSave.parentCodeScheme.codeValue;

    return this.http.post<ApiResponseType>(
      `${codeRegistriesIntakeBasePath}/${registryCodeValue}/${codeSchemes}/${codeSchemeCodeValue}/` +
      `${extensionSchemes}/${extensionSchemeToSave.codeValue}/`, extensionSchemeToSave);
  }

  uploadExtensionSchemes(registryCodeValue: string, schemeCodeValue: string, file: File, format: string): Observable<ExtensionScheme[]> {

    const formData: FormData = new FormData();
    formData.append('file', file, file.name);

    const params = {
      'format': format
    };

    return this.http.post<WithResults<ExtensionSchemeType>>(`${codeRegistriesIntakeBasePath}/${registryCodeValue}/${codeSchemes}/${schemeCodeValue}/${extensionSchemes}`,
      formData, {params})
      .pipe(map(res => res.results.map(data => new ExtensionScheme(data))));
  }

  createExtensionScheme(extensionSchemeToCreate: ExtensionSchemeType,
                        registryCodeValue: string,
                        codeSchemeCodeValue: string): Observable<ExtensionScheme> {
    return this.createExtensionSchemes([extensionSchemeToCreate], registryCodeValue, codeSchemeCodeValue).pipe(map(createdExtensionSchemes => {
      if (createdExtensionSchemes.length !== 1) {
        throw new Error('Exactly one code scheme needs to be created');
      } else {
        console.log('ExtensionScheme created!');
        return createdExtensionSchemes[0];
      }
    }));
  }

  createExtensionSchemes(extensionSchemeList: ExtensionSchemeType[],
                         registryCodeValue: string,
                         codeSchemeCodeValue: string): Observable<ExtensionScheme[]> {

    return this.http.post<WithResults<ExtensionSchemeType>>(`${codeRegistriesIntakeBasePath}/${registryCodeValue}/${codeSchemes}/${codeSchemeCodeValue}/${extensionSchemes}`,
      extensionSchemeList)
      .pipe(map(res => res.results.map(data => new ExtensionScheme(data))));
  }

  deleteExtensionScheme(extensionScheme: ExtensionScheme): Observable<boolean> {

    const registryCodeValue = extensionScheme.parentCodeScheme.codeRegistry.codeValue;
    const codeSchemeCodeValue = extensionScheme.parentCodeScheme.codeValue;

    return this.http.delete(
      `${codeRegistriesIntakeBasePath}/${registryCodeValue}/${codeSchemes}/${codeSchemeCodeValue}/${extensionSchemes}/` +
      `${extensionScheme.codeValue}`, { observe: 'response' } )
      .pipe(
        map(res => res.status === 200),
        catchError(err => of(false))
      );
  }

  deleteExtension(extension: Extension): Observable<boolean> {

    return this.http.delete(
      `${extensionsIntakeBasePath}/${extension.id}`, { observe: 'response' } )
      .pipe(
        map(res => res.status === 200),
        catchError(err => of(false))
      );
  }

  uploadExtensions(registryCodeValue: string,
                   schemeCodeValue: string,
                   extensionSchemeCodeValue: string,
                   file: File,
                   format: string): Observable<Extension[]> {

    const formData: FormData = new FormData();
    formData.append('file', file, file.name);

    const params = {
      'format': format
    };

    return this.http.post<WithResults<ExtensionType>>(
      `${codeRegistriesIntakeBasePath}/${registryCodeValue}/${codeSchemes}/${schemeCodeValue}/${extensionSchemes}/` +
      `${extensionSchemeCodeValue}/${extensions}`,
      formData, {params})
      .pipe(map(res => res.results.map(data => new Extension(data))));
  }

  saveExtension(extensionToSave: ExtensionType): Observable<ApiResponseType> {

    console.log('Saving Extension in dataservice');
    console.log(extensionToSave);

    return this.http.post<ApiResponseType>(
      `${extensionsIntakeBasePath}/${extensionToSave.id}`, extensionToSave);
  }

  createExtension(extension: ExtensionType,
                  registryCodeValue: string,
                  schemeCodeValue: string,
                  extensionSchemeCodeValue: string): Observable<Extension> {

    return this.createExtensions([extension], registryCodeValue, schemeCodeValue, extensionSchemeCodeValue).pipe(map(createdExtensions => {
      if (createdExtensions.length !== 1) {
        throw new Error('Exactly one extension needs to be created');
      } else {
        return createdExtensions[0];
      }
    }));
  }

  createExtensions(extensionList: ExtensionType[],
                   registryCodeValue: string,
                   schemeCodeValue: string,
                   extensionSchemeCodeValue: string): Observable<Extension[]> {

    return this.http.post<WithResults<ExtensionType>>(`${codeRegistriesIntakeBasePath}/${registryCodeValue}/${codeSchemes}/${schemeCodeValue}/` +
      `${extensionSchemes}/${extensionSchemeCodeValue}/${extensions}/`,
      extensionList)
      .pipe(map(res => res.results.map(data => new Extension(data))));
  }

  registryCodeValueExists(registryCodeValue: string): Observable<boolean> {

    return this.http.head(`${codeRegistriesIntakeBasePath}/${registryCodeValue}`, { observe: 'response' } )
      .pipe(
        map(res => res.status === 200),
        catchError(err => of(false))
      );
  }

  codeSchemeCodeValueExists(registryCodeValue: string, schemeCodeValue: string): Observable<boolean> {

    return this.http.head(`${codeRegistriesIntakeBasePath}/${registryCodeValue}/${codeSchemes}/${schemeCodeValue}`, { observe: 'response' } )
      .pipe(
        map(res => res.status === 200),
        catchError(err => of(false))
      );
  }

  codeCodeValueExists(registryCodeValue: string, schemeCodeValue: string, codeCodeValue: string): Observable<boolean> {

    const encodedCodeCodeValue = encodeURIComponent(codeCodeValue);
    return this.http.head(
      `${codeRegistriesIntakeBasePath}/${registryCodeValue}/${codeSchemes}/${schemeCodeValue}/${codes}/${encodedCodeCodeValue}`, { observe: 'response' } )
      .pipe(
        map(res => res.status === 200),
        catchError(err => of(false))
      );
  }

  extensionSchemeCodeValueExists(registryCodeValue: string,
                                 schemeCodeValue: string,
                                 extensionSchemeCodeValue: string): Observable<boolean> {

    const encodedExtensionSchemeCodeValue = encodeURIComponent(extensionSchemeCodeValue);
    return this.http.head(
      `${codeRegistriesIntakeBasePath}/${registryCodeValue}/${codeSchemes}/${schemeCodeValue}/${extensionSchemes}/` +
      `${encodedExtensionSchemeCodeValue}`, { observe: 'response' } )
      .pipe(
        map(res => res.status === 200),
        catchError(err => of(false))
      );
  }

  attachAVariantToCodeScheme(theCodeRegistry: CodeRegistry, variantCodeSchemeId: string, mother: CodeSchemeType): Observable<CodeScheme[]> {

    const registryCodeValue = theCodeRegistry.codeValue;

    return this.http.post<WithResults<CodeSchemeType>>(`${codeRegistriesIntakeBasePath}/${registryCodeValue}/attachvariant/${variantCodeSchemeId}`,
      mother)
      .pipe(map(res => res.results.map(data => new CodeScheme(data))));
  }

  detachAVariantFromCodeScheme(theCodeRegistry: CodeRegistry, idOfVariantToDetach: string, mother: CodeSchemeType): Observable<CodeScheme[]> {
    const registryCodeValue = theCodeRegistry.codeValue;

    return this.http.post<WithResults<CodeSchemeType>>(`${codeRegistriesIntakeBasePath}/${registryCodeValue}/detachvariant/${idOfVariantToDetach}`,
      mother)
      .pipe(map(res => res.results.map(data => new CodeScheme(data))));
  }
}
