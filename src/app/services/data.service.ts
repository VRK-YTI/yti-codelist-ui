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
  PropertyTypeType,
  VocabularyType,
  ConceptType, ExtensionSchemeType, ExtensionType
} from './api-schema';
import { PropertyType } from '../entities/property-type';
import { ExternalReference } from '../entities/external-reference';
import { Organization } from '../entities/organization';
import { ServiceConfiguration } from '../entities/service-configuration';
import { UserRequest } from '../entities/user-request';
import { AuthorizationManager } from './authorization-manager.service';
import {Vocabulary} from '../entities/vocabulary';
import { CodePlain } from '../entities/code-simple';
import {Concept} from '../entities/concept';
import { ExtensionScheme } from '../entities/extension-scheme';
import { Extension } from '../entities/extension';

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

  createRegistry(codeRegistryToSave: CodeRegistryType): Observable<CodeRegistry> {
    return this.createRegistries([codeRegistryToSave]).map(createdRegistries => {
      if (createdRegistries.length !== 1) {
        throw new Error('Exactly one registry needs to be created');
      } else {
        return createdRegistries[0];
      }
    });
  }

  createRegistries(registryList: CodeRegistryType[]): Observable<CodeRegistry[]> {

    return this.http.post(`${codeRegistriesIntakeBasePath}/`,
      registryList)
      .map(res => res.json().results.map((data: CodeRegistryType) => new CodeRegistry(data)));
  }

  saveCodeRegistry(codeRegistryToSave: CodeRegistryType): Observable<ApiResponseType> {

    console.log('saving registry in dataservice');
    console.log(codeRegistryToSave);
    const registryCode = codeRegistryToSave.codeValue;

    return this.http.post(`${codeRegistriesIntakeBasePath}/${registryCode}/`, codeRegistryToSave)
      .map(res => res.json() as ApiResponseType);
  }

  deleteCodeRegistry(theCodeRegistry: CodeRegistry): Observable<ApiResponseType> {

    const registryCode = theCodeRegistry.codeValue;

    return this.http.delete(`${codeRegistriesIntakeBasePath}/${registryCode}`)
      .map(res => res.json() as ApiResponseType);
  }

  getCodeSchemesForCodeRegistry(registryCodeValue: string): Observable<CodeScheme[]> {

    const params = new URLSearchParams();
    params.append('expand', 'codeRegistry,externalReference,propertyType,code,organization,extensionScheme');
    const userOrganizations = Array.from(this.authorizationManager.user.getOrganizations(['ADMIN', 'CODE_LIST_EDITOR']));
    if (userOrganizations.length > 0) {
      params.append('userOrganizations', userOrganizations.join(','));
    }

    return this.http.get(`${codeRegistriesBasePath}/${registryCodeValue}/${codeSchemes}/`, {params})
      .map(res => res.json().results.map((data: CodeSchemeType) => new CodeScheme(data)));
  }

  searchCodeSchemes(searchTerm: string, classification: string | null, organization: string | null,
                    sortMode: string | null, searchCodes: boolean | false, language: string | null): Observable<CodeScheme[]> {

    const params = new URLSearchParams();
    params.append('expand', 'codeRegistry,externalReference,propertyType,code,organization,extensionScheme');
    params.append('searchCodes', searchCodes.toString());
    const userOrganizations = Array.from(this.authorizationManager.user.getOrganizations(['ADMIN', 'CODE_LIST_EDITOR']));
    if (userOrganizations.length > 0) {
      params.append('userOrganizations', userOrganizations.join(','));
    }

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

  getCodeScheme(registryCodeValue: string, schemeCodeValue: string): Observable<CodeScheme> {

    const params = new URLSearchParams();
    params.append('expand', 'codeRegistry,organization,code,externalReference,propertyType,codeScheme,code,extensionScheme');

    return this.http.get(`${codeRegistriesBasePath}/${registryCodeValue}/${codeSchemes}/${schemeCodeValue}/`, {params})
      .map(res => new CodeScheme(res.json() as CodeSchemeType));
  }

  getCodeSchemeWithUuid(codeSchemeUuid: string): Observable<CodeScheme> {
    const params = new URLSearchParams();
    params.append('expand', 'codeRegistry,organization,code,externalReference,propertyType,codeScheme,code,extensionScheme');

    return this.http.get(`${codeSchemesBasePath}/${codeSchemeUuid}`, {params})
      .map(res => new CodeScheme(res.json() as CodeSchemeType));
  }

  getExternalReferences(codeSchemeId: string): Observable<ExternalReference[]> {

    const params = new URLSearchParams();
    params.append('codeSchemeId', codeSchemeId);
    params.append('expand', 'propertyType');

    return this.http.get(`${externalReferencesBasePath}/`, {params})
      .map(res => res.json().results.map((data: ExternalReferenceType) => new ExternalReference(data)));
  }

  getPlainCodes(registryCodeValue: string, schemeCodeValue: string): Observable<CodePlain[]> {

    return this.http.get(`${codeRegistriesBasePath}/${registryCodeValue}/${codeSchemes}/${schemeCodeValue}/${codes}/`)
      .map(res => res.json().results.map((data: CodePlainType) => new CodePlain(data)));
  }

  getCodes(registryCodeValue: string, schemeCodeValue: string): Observable<Code[]> {

    const params = new URLSearchParams();
    params.append('expand', 'codeScheme,codeRegistry,externalReference,propertyType');

    return this.http.get(`${codeRegistriesBasePath}/${registryCodeValue}/${codeSchemes}/${schemeCodeValue}/${codes}/`, {params})
      .map(res => res.json().results.map((data: CodeType) => new Code(data)));
  }

  getCode(registryCodeValue: string, schemeCodeValue: string, codeCodeValue: string): Observable<Code> {

    const params = new URLSearchParams();
    params.append('expand', 'codeScheme,codeRegistry,externalReference,propertyType,organization');
    const encodedCodeCodeValue = encodeURIComponent(codeCodeValue);

    return this.http.get(
      `${codeRegistriesBasePath}/${registryCodeValue}/${codeSchemes}/${schemeCodeValue}/${codes}/${encodedCodeCodeValue}/`,
      {params})
      .map(res => new Code(res.json() as CodeType));
  }

  createCode(code: CodeType, registryCodeValue: string, schemeCodeValue: string): Observable<Code> {
    return this.createCodes([code], registryCodeValue, schemeCodeValue).map(createdCodes => {
      if (createdCodes.length !== 1) {
        throw new Error('Exactly one code needs to be created');
      } else {
        return createdCodes[0];
      }
    });
  }

  createCodes(codeList: CodeType[], registryCodeValue: string, schemeCodeValue: string): Observable<Code[]> {

    return this.http.post(`${codeRegistriesIntakeBasePath}/${registryCodeValue}/${codeSchemes}/${schemeCodeValue}/${codes}/`,
      codeList)
      .map(res => res.json().results.map((data: CodeType) => new Code(data)));
  }

  saveCode(code: CodeType): Observable<ApiResponseType> {

    const registryCodeValue = code.codeScheme.codeRegistry.codeValue;
    const schemeCodeValue = code.codeScheme.codeValue;
    const encodedCodeCodeValue = encodeURIComponent(code.codeValue);

    return this.http.post(
      `${codeRegistriesIntakeBasePath}/${registryCodeValue}/${codeSchemes}/${schemeCodeValue}/${codes}/${encodedCodeCodeValue}/`, code)
      .map(res => res.json() as ApiResponseType);
  }

  deleteCode(code: Code): Observable<boolean> {

    const registryCodeValue = code.codeScheme.codeRegistry.codeValue;
    const schemeCodeValue = code.codeScheme.codeValue;
    const encodedCodeCodeValue = encodeURIComponent(code.codeValue);

    return this.http.delete(
      `${codeRegistriesIntakeBasePath}/${registryCodeValue}/${codeSchemes}/${schemeCodeValue}/${codes}/${encodedCodeCodeValue}/`)
      .map(res => {
        return res.status === 200;
      }).catch(error => {
        return Observable.of(false);
      });
  }

  createCodeScheme(codeSchemeToCreate: CodeSchemeType, registryCodeValue: string): Observable<CodeScheme> {
    return this.createCodeSchemes([codeSchemeToCreate], registryCodeValue).map(createdCodeSchemes => {
      if (createdCodeSchemes.length !== 1) {
        throw new Error('Exactly one code scheme needs to be created');
      } else {
        return createdCodeSchemes[0];
      }
    });
  }

  cloneCodeScheme(codeSchemeToClone: CodeSchemeType, registryCodeValue: string, originalCodeSchemeUuid: string): Observable<CodeScheme> {
    const clonedCodeScheme: Observable<CodeScheme> =
      this.http.post(`${codeRegistriesIntakeBasePath}/${registryCodeValue}/clone/codescheme/${originalCodeSchemeUuid}`,
      codeSchemeToClone)
      .map(res => res.json().results.map((data: CodeSchemeType) => new CodeScheme(data)));
    return clonedCodeScheme;
  }

  createCodeSchemes(codeSchemeList: CodeSchemeType[], registryCodeValue: string): Observable<CodeScheme[]> {

    return this.http.post(`${codeRegistriesIntakeBasePath}/${registryCodeValue}/${codeSchemes}/`,
      codeSchemeList)
      .map(res => res.json().results.map((data: CodeSchemeType) => new CodeScheme(data)));
  }

  saveCodeScheme(codeSchemeToSave: CodeSchemeType): Observable<ApiResponseType> {
    const registryCode = codeSchemeToSave.codeRegistry.codeValue;

    return this.http.post(`${codeRegistriesIntakeBasePath}/${registryCode}/${codeSchemes}/${codeSchemeToSave.codeValue}/`, codeSchemeToSave)
      .map(res => res.json() as ApiResponseType);
  }

  deleteCodeScheme(theCodeScheme: CodeScheme): Observable<boolean> {

    const registryCode = theCodeScheme.codeRegistry.codeValue;

    return this.http.delete(`${codeRegistriesIntakeBasePath}/${registryCode}/${codeSchemes}/${theCodeScheme.codeValue}/`)
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

  uploadCodes(registryCodeValue: string, schemeCodeValue: string, file: File, format: string): Observable<CodeScheme[]> {

    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    const params = new URLSearchParams();
    params.append('format', format);

    return this.http.post(`${codeRegistriesIntakeBasePath}/${registryCodeValue}/${codeSchemes}/${schemeCodeValue}/${codes}`,
      formData, {params})
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
      .map(response => response.json().results.map((data: VocabularyType) => new Vocabulary(data)));
  }

  getConcepts(searchTerm: string, vocab: string | null): Observable<Concept[]> {
    const encodedSearchTerm = encodeURIComponent(searchTerm);
    return this.http.get(`${terminologyConceptsPath}/${searchterm}/${encodedSearchTerm}/${vocabulary}/${vocab || '0'}`, undefined)
      .map(response => response.json().results.map((data: ConceptType) => new Concept(data)));
  }

  getExtensionScheme(registryCodeValue: string, schemeCodeValue: string, extensionSchemeCodeValue: string): Observable<ExtensionScheme> {

    const params = new URLSearchParams();
    params.append('expand', 'codeRegistry,organization,code,externalReference,propertyType,codeScheme,code');

    return this.http.get(
      `${codeRegistriesBasePath}/${registryCodeValue}/${codeSchemes}/${schemeCodeValue}/${extensionSchemes}/${extensionSchemeCodeValue}`,
      {params})
      .map(res => new ExtensionScheme(res.json() as ExtensionSchemeType));
  }

  getExtensionSchemes(registryCodeValue: string, schemeCodeValue: string): Observable<ExtensionScheme[]> {

    const params = new URLSearchParams();
    params.append('expand', 'codeScheme,codeRegistry,externalReference,propertyType');

    return this.http.get(`${codeRegistriesBasePath}/${registryCodeValue}/${codeSchemes}/${schemeCodeValue}/${extensionSchemes}/`, {params})
      .map(res => res.json().results.map((data: ExtensionSchemeType) => new ExtensionScheme(data)));
  }

  getExtension(extensionId: string): Observable<Extension> {

    const params = new URLSearchParams();
    params.append('expand', 'extensionScheme,codeRegistry,organization,code,externalReference,propertyType,codeScheme,code');

    return this.http.get(
      `${extensionsBasePath}/${extensionId}`,
      {params})
      .map(res => new Extension(res.json() as ExtensionType));
  }

  getExtensions(registryCodeValue: string, schemeCodeValue: string, extensionSchemeCodeValue: string): Observable<Extension[]> {

    const params = new URLSearchParams();
    params.append('expand', 'extensionScheme,codeRegistry,organization,code,externalReference,propertyType,codeScheme,code');

    return this.http.get(
      `${codeRegistriesBasePath}/${registryCodeValue}/${codeSchemes}/${schemeCodeValue}/${extensionSchemes}/` +
      `${extensionSchemeCodeValue}/${extensions}/`,
      {params})
      .map(res => res.json().results.map((data: ExtensionType) => new Extension(data)));
  }

  saveExtensionScheme(extensionSchemeToSave: ExtensionSchemeType): Observable<ApiResponseType> {

    console.log('Saving ExtensionScheme in dataservice');
    console.log(extensionSchemeToSave);
    const registryCodeValue = extensionSchemeToSave.parentCodeScheme.codeRegistry.codeValue;
    const codeSchemeCodeValue = extensionSchemeToSave.parentCodeScheme.codeValue;

    return this.http.post(
      `${codeRegistriesIntakeBasePath}/${registryCodeValue}/${codeSchemes}/${codeSchemeCodeValue}/` +
      `${extensionSchemes}/${extensionSchemeToSave.codeValue}/`, extensionSchemeToSave)
      .map(res => res.json() as ApiResponseType);
  }

  uploadExtensionSchemes(registryCodeValue: string, schemeCodeValue: string, file: File, format: string): Observable<ExtensionScheme[]> {

    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    const params = new URLSearchParams();
    params.append('format', format);

    return this.http.post(`${codeRegistriesIntakeBasePath}/${registryCodeValue}/${codeSchemes}/${schemeCodeValue}/${extensionSchemes}`,
      formData, {params})
      .map(res => res.json().results.map((data: ExtensionSchemeType) => new ExtensionScheme(data)));
  }

  createExtensionScheme(extensionSchemeToCreate: ExtensionSchemeType,
                        registryCodeValue: string,
                        codeSchemeCodeValue: string): Observable<ExtensionScheme> {
    return this.createExtensionSchemes([extensionSchemeToCreate], registryCodeValue, codeSchemeCodeValue).map(createdExtensionSchemes => {
      if (createdExtensionSchemes.length !== 1) {
        throw new Error('Exactly one code scheme needs to be created');
      } else {
        console.log('ExtensionScheme created!');
        return createdExtensionSchemes[0];
      }
    });
  }

  createExtensionSchemes(extensionSchemeList: ExtensionSchemeType[],
                         registryCodeValue: string,
                         codeSchemeCodeValue: string): Observable<ExtensionScheme[]> {

    return this.http.post(`${codeRegistriesIntakeBasePath}/${registryCodeValue}/${codeSchemes}/${codeSchemeCodeValue}/${extensionSchemes}`,
      extensionSchemeList)
      .map(res => res.json().results.map((data: ExtensionSchemeType) => new ExtensionScheme(data)));
  }

  deleteExtensionScheme(extensionScheme: ExtensionScheme): Observable<boolean> {

    const registryCodeValue = extensionScheme.parentCodeScheme.codeRegistry.codeValue;
    const codeSchemeCodeValue = extensionScheme.parentCodeScheme.codeValue;

    return this.http.delete(
      `${codeRegistriesIntakeBasePath}/${registryCodeValue}/${codeSchemes}/${codeSchemeCodeValue}/${extensionSchemes}/` +
      `${extensionScheme.codeValue}`)
      .map(res => {
        return res.status === 200;
      }).catch(error => {
        return Observable.of(false);
      });
  }

  deleteExtension(extension: Extension): Observable<boolean> {

    return this.http.delete(
      `${extensionsIntakeBasePath}/${extension.id}`)
      .map(res => {
        return res.status === 200;
      }).catch(error => {
        return Observable.of(false);
      });
  }

  uploadExtensions(registryCodeValue: string,
                   schemeCodeValue: string,
                   extensionSchemeCodeValue: string,
                   file: File,
                   format: string): Observable<Extension[]> {

    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    const params = new URLSearchParams();
    params.append('format', format);

    return this.http.post(
      `${codeRegistriesIntakeBasePath}/${registryCodeValue}/${codeSchemes}/${schemeCodeValue}/${extensionSchemes}/` +
      `${extensionSchemeCodeValue}/${extensions}`,
      formData, {params})
      .map(res => res.json().results.map((data: ExtensionType) => new Extension(data)));
  }

  saveExtension(extensionToSave: ExtensionType): Observable<ApiResponseType> {

    console.log('Saving Extension in dataservice');
    console.log(extensionToSave);

    return this.http.post(
      `${extensionsIntakeBasePath}/${extensionToSave.id}`, extensionToSave)
      .map(res => res.json() as ApiResponseType);
  }

  createExtension(extension: ExtensionType,
                  registryCodeValue: string,
                  schemeCodeValue: string,
                  extensionSchemeCodeValue: string): Observable<Extension> {
    return this.createExtensions([extension], registryCodeValue, schemeCodeValue, extensionSchemeCodeValue).map(createdExtensions => {
      if (createdExtensions.length !== 1) {
        throw new Error('Exactly one extension needs to be created');
      } else {
        return createdExtensions[0];
      }
    });
  }

  createExtensions(extensionList: ExtensionType[],
                   registryCodeValue: string,
                   schemeCodeValue: string,
                   extensionSchemeCodeValue: string): Observable<Extension[]> {

    return this.http.post(`${codeRegistriesIntakeBasePath}/${registryCodeValue}/${codeSchemes}/${schemeCodeValue}/` +
    `${extensionSchemes}/${extensionSchemeCodeValue}/${extensions}/`,
      extensionList)
      .map(res => res.json().results.map((data: ExtensionType) => new Extension(data)));
  }

  registryCodeValueExists(registryCodeValue: string): Observable<boolean> {

    return this.http.head(`${codeRegistriesIntakeBasePath}/${registryCodeValue}`)
      .map(res => {
        return res.status === 200;
      }).catch(error => {
        return Observable.of(false);
      });
  }

  codeSchemeCodeValueExists(registryCodeValue: string, schemeCodeValue: string): Observable<boolean> {

    return this.http.head(`${codeRegistriesIntakeBasePath}/${registryCodeValue}/${codeSchemes}/${schemeCodeValue}`)
      .map(res => {
        return res.status === 200;
      }).catch(error => {
        return Observable.of(false);
      });
  }

  codeCodeValueExists(registryCodeValue: string, schemeCodeValue: string, codeCodeValue: string): Observable<boolean> {

    const encodedCodeCodeValue = encodeURIComponent(codeCodeValue);
    return this.http.head(
      `${codeRegistriesIntakeBasePath}/${registryCodeValue}/${codeSchemes}/${schemeCodeValue}/${codes}/${encodedCodeCodeValue}`)
      .map(res => {
        return res.status === 200;
      }).catch(error => {
        return Observable.of(false);
      });
  }

  extensionSchemeCodeValueExists(registryCodeValue: string,
                                 schemeCodeValue: string,
                                 extensionSchemeCodeValue: string): Observable<boolean> {

    const encodedExtensionSchemeCodeValue = encodeURIComponent(extensionSchemeCodeValue);
    return this.http.head(
      `${codeRegistriesIntakeBasePath}/${registryCodeValue}/${codeSchemes}/${schemeCodeValue}/${extensionSchemes}/` +
      `${encodedExtensionSchemeCodeValue}`)
      .map(res => {
        return res.status === 200;
      }).catch(error => {
        return Observable.of(false);
      });
  }

  attachAVariantToCodeScheme(theCodeRegistry: CodeRegistry, variantCodeSchemeId: string, mother: CodeScheme): Observable<CodeScheme> {

    const registryCodeValue = theCodeRegistry.codeValue;

    const resultCodeScheme: Observable<CodeScheme> =
      this.http.post(`${codeRegistriesIntakeBasePath}/${registryCodeValue}/attachvariant/${variantCodeSchemeId}`,
        mother)
        .map(res => res.json().results.map((data: CodeSchemeType) => new CodeScheme(data)));
    return resultCodeScheme;
  }

}
