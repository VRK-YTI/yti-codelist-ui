import { Injectable } from '@angular/core';
import { CodeScheme } from '../entities/code-scheme';
import { CodeRegistry } from '../entities/code-registry';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { InfoDomain } from '../entities/info-domain';
import { Code } from '../entities/code';
import {
  ApiResponseType,
  CodePlainType,
  CodeRegistryType,
  CodeSchemeType,
  CodeType,
  ConceptResponseType,
  ConceptType,
  ExtensionType,
  ExternalReferenceType,
  InfoDomainType,
  MemberSimpleType,
  MemberType,
  OrganizationType,
  PropertyTypeType,
  UserSimpleType,
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
import { Extension } from '../entities/extension';
import { Member } from '../entities/member';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { MemberSimple } from '../entities/member-simple';
import { UserSimple } from '../entities/user-simple';
import { ConceptResponse } from '../entities/concept-response';

const intakeContext = 'codelist-intake';
const apiContext = 'codelist-api';
const api = 'api';
const terminologyContext = 'terminology';

const version = 'v1';
const system = 'system';
const registries = 'coderegistries';
const configuration = 'configuration';
const codeSchemes = 'codeschemes';
const codes = 'codes';
const externalReferences = 'externalreferences';
const infodomains = 'infodomains';
const propertytypes = 'propertytypes';
const extensions = 'extensions';
const members = 'members';
const users = 'users';
const user = 'user';
const organizations = 'organizations';
const fakeableUsers = 'fakeableUsers';
const groupmanagement = 'groupmanagement';
const requests = 'requests';
const request = 'request';
const vocabularies = 'vocabularies';
const concepts = 'concepts';
const suggestion = 'suggestion';

const codeSchemesBasePath = `/${apiContext}/${api}/${version}/${codeSchemes}`;
const codeRegistriesBasePath = `/${apiContext}/${api}/${version}/${registries}`;
const membersBasePath = `/${apiContext}/${api}/${version}/${members}`;
const membersIntakeBasePath = `/${intakeContext}/${api}/${version}/${members}`;
const usersIntakeBasePath = `/${intakeContext}/${api}/${version}/${users}`;
const configurationIntakeBasePath = `/${intakeContext}/${api}/${version}/${system}/${configuration}`;
const externalReferencesBasePath = `/${apiContext}/${api}/${version}/${externalReferences}`;
const codeRegistriesIntakeBasePath = `/${intakeContext}/${api}/${version}/${registries}`;
const infoDomainsBasePath = `/${intakeContext}/${api}/${version}/${infodomains}`;
const propertyTypesBasePath = `/${apiContext}/${api}/${version}/${propertytypes}`;
const organizationsBasePath = `/${intakeContext}/${api}/${version}/${organizations}`;
const fakeableUsersPath = `/${intakeContext}/${api}/${fakeableUsers}`;
const groupManagementRequestBasePath = `/${intakeContext}/${api}/${version}/${groupmanagement}/${request}`;
const groupManagementRequestsBasePath = `/${intakeContext}/${api}/${version}/${groupmanagement}/${requests}`;
const terminologyBasePath = `/${intakeContext}/${api}/${version}/${terminologyContext}`;
const terminologyVocabulariesPath = `${terminologyBasePath}/${vocabularies}`;
const terminologyConceptsPath = `${terminologyBasePath}/${concepts}`;
const terminologyConceptSuggestionPath = `${terminologyBasePath}/${suggestion}`;

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

    return this.http.get<WithResults<CodeRegistryType>>(codeRegistriesBasePath, { params })
      .pipe(map(res => res.results.map(data => new CodeRegistry(data))));
  }

  getCodeRegistriesForUser(): Observable<CodeRegistry[]> {

    return this.getCodeRegistries().pipe(map(r => this.authorizationManager.filterAllowedRegistriesForUser(r)));
  }

  getOrganizations(): Observable<Organization[]> {

    return this.http.get<WithResults<OrganizationType>>(organizationsBasePath)
      .pipe(map(res => res.results.map(data => new Organization(data))));
  }

  getOrganizationsWithCodeSchemes(): Observable<Organization[]> {

    const params = {
      onlyOrganizationsWithCodeSchemes: 'true'
    };

    return this.http.get<WithResults<OrganizationType>>(organizationsBasePath, { params })
      .pipe(map(res => res.results.map(data => new Organization(data))));
  }

  getCodeRegistry(coderegistryCode: string): Observable<CodeRegistry> {

    const params = {
      expand: 'organization'
    };

    return this.http.get<CodeRegistryType>(`${codeRegistriesBasePath}/${coderegistryCode}/`, { params })
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

    const registryCode = codeRegistryToSave.codeValue;

    return this.http.post<ApiResponseType>(`${codeRegistriesIntakeBasePath}/${registryCode}/`, codeRegistryToSave);
  }

  deleteCodeRegistry(theCodeRegistry: CodeRegistry): Observable<ApiResponseType> {

    const registryCode = theCodeRegistry.codeValue;

    return this.http.delete<ApiResponseType>(`${codeRegistriesIntakeBasePath}/${registryCode}`);
  }

  getCodeSchemesForCodeRegistry(registryCodeValue: string): Observable<CodeScheme[]> {

    let params = new HttpParams()
      .append('expand', 'codeRegistry,externalReference,propertyType,code,organization,extension,valueType');
    const userOrganizations = Array.from(this.authorizationManager.user.getOrganizations(['ADMIN', 'CODE_LIST_EDITOR', 'TERMINOLOGY_EDITOR', 'DATA_MODEL_EDITOR', 'MEMBER']));
    if (this.authorizationManager.user.superuser) {
      params = params.append('includeIncomplete', 'true');
    } else if (userOrganizations.length > 0) {
      params = params.append('userOrganizations', userOrganizations.join(','));
    }

    return this.http.get<WithResults<CodeSchemeType>>(`${codeRegistriesBasePath}/${registryCodeValue}/${codeSchemes}/`, { params })
      .pipe(map(res => res.results.map(data => new CodeScheme(data))));
  }

  searchCodeSchemes(searchTerm: string | null, extensionPropertyType: string | null, infoDomain: string | null, organization: string | null,
                    sortMode: string | null, searchCodes: boolean | false, searchExtensions: boolean | false, language: string | null): Observable<CodeScheme[]> {

    let params = new HttpParams()
      .append('expand', 'codeRegistry,externalReference,propertyType,code,organization,extension,valueType,searchHit')
      .append('searchCodes', searchCodes.toString())
      .append('searchExtensions', searchExtensions.toString());

    const userOrganizations = Array.from(this.authorizationManager.user.getOrganizations(['ADMIN', 'CODE_LIST_EDITOR', 'TERMINOLOGY_EDITOR', 'DATA_MODEL_EDITOR', 'MEMBER']));
    if (this.authorizationManager.user.superuser) {
      params = params.append('includeIncomplete', 'true');
    } else if (userOrganizations.length > 0) {
      params = params.append('userOrganizations', userOrganizations.join(','));
    }

    if (extensionPropertyType) {
      params = params.append('extensionPropertyType', extensionPropertyType);
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

    if (infoDomain) {
      params = params.append('infoDomain', infoDomain);
    }

    if (organization) {
      params = params.append('organizations', organization);
    }

    return this.http.get<WithResults<CodeSchemeType>>(`${codeSchemesBasePath}`, { params })
      .pipe(map(res => res.results.map(data => new CodeScheme(data))));
  }

  getPropertyTypes(context: string, language: string): Observable<PropertyType[]> {

    const params = new HttpParams()
      .append('expand', 'valueType')
      .append('context', context)
      .append('language', language);

    return this.http.get<WithResults<PropertyTypeType>>(`${propertyTypesBasePath}/`, { params })
      .pipe(map(res => res.results.map(data => new PropertyType(data))));
  }

  getPropertyType(propertyTypeLocalName: string): Observable<PropertyType> {

    const params = new HttpParams()
      .append('expand', 'valueType');

    return this.http.get<PropertyTypeType>(`${propertyTypesBasePath}/${propertyTypeLocalName}`, { params })
      .pipe(map(res => new PropertyType(res)));
  }

  getInfoDomains(language: string): Observable<InfoDomain[]> {

    const params = {
      language: language
    };

    return this.http.get<WithResults<InfoDomainType>>(`${infoDomainsBasePath}/`, { params })
      .pipe(map(res => res.results.map((data: InfoDomainType) => new InfoDomain(data))));
  }

  getInfoDomainsAsCodes(language: string | undefined): Observable<Code[]> {

    let params = new HttpParams()
      .append('expand', 'codeScheme,codeRegistry,externalReference,propertyType,valueType')
      .append('hierarchyLevel', '1');

    if (language) {
      params = params.append('language', language);
    }

    return this.http.get<WithResults<CodeType>>(`${codeRegistriesBasePath}/jupo/${codeSchemes}/serviceclassification/${codes}/`, { params })
      .pipe(map(res => res.results.map(data => new Code(data))));
  }

  getCodeScheme(registryCodeValue: string, schemeCodeValue: string): Observable<CodeScheme> {

    const params = {
      'expand': 'codeRegistry,organization,code,externalReference,propertyType,codeScheme,code,extension,valueType'
    };

    return this.http.get<CodeSchemeType>(`${codeRegistriesBasePath}/${registryCodeValue}/${codeSchemes}/${schemeCodeValue}/`, { params })
      .pipe(map(res => new CodeScheme(res)));
  }

  getCodeSchemeWithUuid(codeSchemeUuid: string): Observable<CodeScheme> {

    const params = {
      'expand': 'codeRegistry,organization,code,externalReference,propertyType,codeScheme,code,extension,valueType'
    };

    return this.http.get<CodeSchemeType>(`${codeSchemesBasePath}/${codeSchemeUuid}`, { params })
      .pipe(map(res => new CodeScheme(res)));
  }

  getExternalReferences(codeSchemeId: string | undefined): Observable<ExternalReference[]> {

    let params = new HttpParams()
      .append('expand', 'propertyType');

    if (codeSchemeId) {
      params = params.append('codeSchemeId', codeSchemeId);
    }

    return this.http.get<WithResults<ExternalReferenceType>>(`${externalReferencesBasePath}/`, { params })
      .pipe(map(res => res.results.map(data => new ExternalReference(data))));
  }

  getPlainCodes(registryCodeValue: string, schemeCodeValue: string): Observable<CodePlain[]> {

    return this.http.get<WithResults<CodePlainType>>(`${codeRegistriesBasePath}/${registryCodeValue}/${codeSchemes}/${schemeCodeValue}/${codes}/`)
      .pipe(map(res => res.results.map(data => new CodePlain(data))));
  }

  getLanguageCodes(language: string): Observable<Code[]> {

    return this.getCodes('interoperabilityplatform', 'languagecodes', language);
  }

  getCodes(registryCodeValue: string, schemeCodeValue: string, language: string | undefined): Observable<Code[]> {

    let params = new HttpParams()
      .append('expand', 'codeScheme,codeRegistry,externalReference,propertyType,valueType,extension');

    if (language) {
      params = params.append('language', language);
    }

    return this.http.get<WithResults<CodeType>>(`${codeRegistriesBasePath}/${registryCodeValue}/${codeSchemes}/${schemeCodeValue}/${codes}/`, { params })
      .pipe(map(res => res.results.map(data => new Code(data))));
  }

  getCode(registryCodeValue: string, schemeCodeValue: string, codeCodeValue: string): Observable<Code> {

    const params = {
      'expand': 'codeScheme,codeRegistry,externalReference,propertyType,organization,valueType,extension,member,memberValue'
    };

    const encodedCodeCodeValue = this.resolveCodeCodeValue(codeCodeValue);
    return this.http.get<CodeType>(
      `${codeRegistriesBasePath}/${registryCodeValue}/${codeSchemes}/${schemeCodeValue}/${codes}/${encodedCodeCodeValue}/`,
      { params })
      .pipe(map(res => new Code(res)));
  }

  createCode(code: CodeType, registryCodeValue: string, schemeCodeValue: string): Observable<Code> {

    return this.createCodes([code], registryCodeValue, schemeCodeValue, null, null).pipe(map(createdCodes => {
      if (createdCodes.length !== 1) {
        throw new Error('Exactly one code needs to be created');
      } else {
        return createdCodes[0];
      }
    }));
  }

  createCodes(codeList: CodeType[], registryCodeValue: string, schemeCodeValue: string, initialCodeStatus: string | null, endCodeStatus: string | null): Observable<Code[]> {

    const params = {
      'initialCodeStatus': initialCodeStatus ? initialCodeStatus : '',
      'endCodeStatus': endCodeStatus ? endCodeStatus : ''
    };

    return this.http.post<WithResults<CodeType>>(`${codeRegistriesIntakeBasePath}/${registryCodeValue}/${codeSchemes}/${schemeCodeValue}/${codes}/`,
      codeList, { params })
      .pipe(map(res => res.results.map(data => new Code(data))));
  }

  saveCode(code: CodeType): Observable<ApiResponseType> {

    const registryCodeValue = code.codeScheme.codeRegistry.codeValue;
    const schemeCodeValue = code.codeScheme.codeValue;
    const codeCodeValue = code.codeValue;
    const encodedCodeCodeValue = this.resolveCodeCodeValue(codeCodeValue);

    return this.http.post<ApiResponseType>(
      `${codeRegistriesIntakeBasePath}/${registryCodeValue}/${codeSchemes}/${schemeCodeValue}/${codes}/${encodedCodeCodeValue}/`, code);
  }

  deleteCode(code: Code): Observable<ApiResponseType> {

    const registryCodeValue = code.codeScheme.codeRegistry.codeValue;
    const schemeCodeValue = code.codeScheme.codeValue;
    const encodedCodeCodeValue = this.resolveCodeCodeValue(code.codeValue);

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

  cloneCodeScheme(codeSchemeToClone: CodeSchemeType, registryCodeValue: string, originalCodeSchemeUuid: string, newVersionEmpty: boolean): Observable<CodeScheme[]> {

    return this.http.post<WithResults<CodeSchemeType>>(`${codeRegistriesIntakeBasePath}/${registryCodeValue}/clone/codescheme/${originalCodeSchemeUuid}/newversionempty/${newVersionEmpty}`,
      codeSchemeToClone)
      .pipe(map(res => res.results.map((data: CodeSchemeType) => new CodeScheme(data))));
  }

  createCodeSchemes(codeSchemeList: CodeSchemeType[], registryCodeValue: string): Observable<CodeScheme[]> {

    return this.http.post<WithResults<CodeSchemeType>>(`${codeRegistriesIntakeBasePath}/${registryCodeValue}/${codeSchemes}/`,
      codeSchemeList)
      .pipe(map(res => res.results.map(data => new CodeScheme(data))));
  }

  saveCodeScheme(codeSchemeToSave: CodeSchemeType, changeCodeStatuses: string): Observable<ApiResponseType> {

    const registryCode = codeSchemeToSave.codeRegistry.codeValue;

    const params = {
      'changeCodeStatuses': changeCodeStatuses
    };

    return this.http.post<ApiResponseType>(`${codeRegistriesIntakeBasePath}/${registryCode}/${codeSchemes}/${codeSchemeToSave.codeValue}/`, codeSchemeToSave, { params });
  }

  deleteCodeScheme(theCodeScheme: CodeScheme): Observable<ApiResponseType> {

    const registryCode = theCodeScheme.codeRegistry.codeValue;

    return this.http.delete<ApiResponseType>(`${codeRegistriesIntakeBasePath}/${registryCode}/${codeSchemes}/${theCodeScheme.codeValue}/`);
  }

  validateNewCodeSchemeVersionCreationThruFile(registryCode: string, file: File, format: string): Observable<HttpResponse<Object>> {

    const formData: FormData = new FormData();
    formData.append('file', file, file.name);

    const params = {
      'format': format
    };

    return this.http.post(`${codeRegistriesIntakeBasePath}/${registryCode}/${codeSchemes}/validate`, formData, {
      params,
      observe: 'response'
    });

  }

  uploadCodeSchemes(registryCode: string, file: File, format: string, newVersion: boolean = false, originalCodeSchemeId: string, updatingExistingCodeScheme: boolean): Observable<CodeScheme[]> {

    const formData: FormData = new FormData();
    formData.append('file', file, file.name);

    const params = {
      'format': format,
      'originalCodeSchemeId': originalCodeSchemeId,
      'newVersionOfCodeScheme': String(newVersion),
      'updatingExistingCodeScheme': String(updatingExistingCodeScheme)
    };

    return this.http.post<WithResults<CodeSchemeType>>(`${codeRegistriesIntakeBasePath}/${registryCode}/${codeSchemes}/`, formData, { params })
      .pipe(map(res => res.results.map(data => new CodeScheme(data))));
  }

  uploadCodes(registryCodeValue: string, schemeCodeValue: string, file: File, format: string): Observable<Code[]> {

    const formData: FormData = new FormData();
    formData.append('file', file, file.name);

    const params = {
      'format': format
    };

    return this.http.post<WithResults<CodeType>>(`${codeRegistriesIntakeBasePath}/${registryCodeValue}/${codeSchemes}/${schemeCodeValue}/${codes}`,
      formData, { params })
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

  getConcepts(searchTerm: string, containerUri: string | null, status: string | null, language: string | null): Observable<ConceptResponse> {

    const params = new HttpParams()
      .append('language', language ? language : '')
      .append('status', status ? status : '')
      .append('containerUri', containerUri ? containerUri : '')
      .append('searchTerm', searchTerm)
      .append('pageSize', '200');
    return this.http.get<ConceptResponseType>(`${terminologyConceptsPath}/`, { params })
      .pipe(map(response => new ConceptResponse(response)));
  }

  getExtension(registryCodeValue: string, schemeCodeValue: string, extensionCodeValue: string): Observable<Extension> {

    const params = {
      'expand': 'codeRegistry,organization,code,externalReference,propertyType,codeScheme,code,valueType'
    };

    return this.http.get<ExtensionType>(
      `${codeRegistriesBasePath}/${registryCodeValue}/${codeSchemes}/${schemeCodeValue}/${extensions}/${extensionCodeValue}`,
      { params })
      .pipe(map(res => new Extension(res)));
  }

  getExtensions(registryCodeValue: string, schemeCodeValue: string): Observable<Extension[]> {

    const params = {
      'expand': 'codeScheme,codeRegistry,externalReference,propertyType'
    };

    return this.http.get<WithResults<ExtensionType>>(`${codeRegistriesBasePath}/${registryCodeValue}/${codeSchemes}/${schemeCodeValue}/${extensions}/`, { params })
      .pipe(map(res => res.results.map(data => new Extension(data))));
  }

  getMember(memberId: string, extensionCodeValue: string): Observable<Member> {

    const params = {
      'expand': 'extension,codeRegistry,organization,code,externalReference,propertyType,codeScheme,code,valueType,memberValue',
      'extensionCodeValue': extensionCodeValue
    };

    return this.http.get<MemberType>(
      `${membersBasePath}/${memberId}`,
      { params })
      .pipe(map(res => new Member(res)));
  }

  getSimpleMembers(registryCodeValue: string, schemeCodeValue: string, extensionCodeValue: string): Observable<MemberSimple[]> {

    const params = {
      'expand': 'code,memberValue,valueType,codeScheme,codeRegistry'
    };

    return this.http.get<WithResults<MemberSimpleType>>(
      `${codeRegistriesBasePath}/${registryCodeValue}/${codeSchemes}/${schemeCodeValue}/${extensions}/` +
      `${extensionCodeValue}/${members}/`,
      { params })
      .pipe(map(res => res.results.map((data: MemberSimpleType) => new MemberSimple(data))));
  }

  getMembers(registryCodeValue: string, schemeCodeValue: string, extensionCodeValue: string): Observable<Member[]> {

    const params = {
      'expand': 'extension,codeRegistry,organization,code,externalReference,propertyType,codeScheme,valueType,memberValue'
    };

    return this.http.get<WithResults<MemberType>>(
      `${codeRegistriesBasePath}/${registryCodeValue}/${codeSchemes}/${schemeCodeValue}/${extensions}/` +
      `${extensionCodeValue}/${members}/`,
      { params })
      .pipe(map(res => res.results.map((data: MemberType) => new Member(data))));
  }

  getMembersWithoutParents(registryCodeValue: string, schemeCodeValue: string, extensionCodeValue: string): Observable<Member[]> {

    const params = {
      'expand': 'extension,codeRegistry,organization,code,externalReference,propertyType,codeScheme,valueType,memberValue'
    };

    return this.http.get<WithResults<MemberType>>(
      `${codeRegistriesBasePath}/${registryCodeValue}/${codeSchemes}/${schemeCodeValue}/${extensions}/` +
      `${extensionCodeValue}/${members}/`,
      { params })
      .pipe(
        map(res => res.results.map((data: MemberType) => new Member(data))
          .filter(member => member.relatedMember === undefined)));
  }

  saveExtension(extensionToSave: ExtensionType): Observable<ApiResponseType> {

    if (extensionToSave.parentCodeScheme) {
      const registryCodeValue = extensionToSave.parentCodeScheme.codeRegistry.codeValue;
      const codeSchemeCodeValue = extensionToSave.parentCodeScheme.codeValue;

      return this.http.post<ApiResponseType>(
        `${codeRegistriesIntakeBasePath}/${registryCodeValue}/${codeSchemes}/${codeSchemeCodeValue}/` +
        `${extensions}/${extensionToSave.codeValue}/`, extensionToSave);
    } else {
      throw new Error('Extension does not have parentcodescheme mapped, failing!');
    }
  }

  uploadExtensions(registryCodeValue: string, schemeCodeValue: string, file: File, format: string): Observable<Extension[]> {

    const formData: FormData = new FormData();
    formData.append('file', file, file.name);

    const params = {
      'format': format
    };

    return this.http.post<WithResults<ExtensionType>>(`${codeRegistriesIntakeBasePath}/${registryCodeValue}/${codeSchemes}/${schemeCodeValue}/${extensions}`,
      formData, { params })
      .pipe(map(res => res.results.map(data => new Extension(data))));
  }

  createExtension(extensionToCreate: ExtensionType,
                  registryCodeValue: string,
                  codeSchemeCodeValue: string,
                  autoCreateMembers: boolean): Observable<Extension> {

    return this.createExtensions([extensionToCreate], registryCodeValue, codeSchemeCodeValue, autoCreateMembers).pipe(map(createdExtensions => {
      if (createdExtensions.length !== 1) {
        throw new Error('Exactly one extension needs to be created');
      } else {
        return createdExtensions[0];
      }
    }));
  }

  createExtensions(extensionList: ExtensionType[],
                   registryCodeValue: string,
                   codeSchemeCodeValue: string,
                   autoCreateMembers: boolean): Observable<Extension[]> {

    const params = {
      'autoCreateMembers': String(autoCreateMembers)
    };


    return this.http.post<WithResults<ExtensionType>>(`${codeRegistriesIntakeBasePath}/${registryCodeValue}/${codeSchemes}/${codeSchemeCodeValue}/${extensions}`,
      extensionList,
      { params })
      .pipe(map(res => res.results.map(data => new Extension(data))));
  }

  deleteExtension(extension: Extension): Observable<boolean> {

    const registryCodeValue = extension.parentCodeScheme.codeRegistry.codeValue;
    const codeSchemeCodeValue = extension.parentCodeScheme.codeValue;

    return this.http.delete(
      `${codeRegistriesIntakeBasePath}/${registryCodeValue}/${codeSchemes}/${codeSchemeCodeValue}/${extensions}/` +
      `${extension.codeValue}`, { observe: 'response' })
      .pipe(
        map(res => res.status === 200),
        catchError(err => of(false))
      );
  }

  deleteMember(extension: Member): Observable<boolean> {

    return this.http.delete(
      `${membersIntakeBasePath}/${extension.id}`, { observe: 'response' })
      .pipe(
        map(res => res.status === 200),
        catchError(err => of(false))
      );
  }

  uploadMembers(registryCodeValue: string,
                schemeCodeValue: string,
                extensionCodeValue: string,
                file: File,
                format: string): Observable<Member[]> {

    const formData: FormData = new FormData();
    formData.append('file', file, file.name);

    const params = {
      'format': format
    };

    return this.http.post<WithResults<MemberType>>(
      `${codeRegistriesIntakeBasePath}/${registryCodeValue}/${codeSchemes}/${schemeCodeValue}/${extensions}/` +
      `${extensionCodeValue}/${members}`,
      formData, { params })
      .pipe(map(res => res.results.map(data => new Member(data))));
  }

  saveMember(memberToSave: MemberType): Observable<ApiResponseType> {

    return this.http.post<ApiResponseType>(
      `${membersIntakeBasePath}/${memberToSave.id}`, memberToSave);
  }

  createMember(member: MemberType,
               registryCodeValue: string,
               schemeCodeValue: string,
               extensionCodeValue: string): Observable<Member> {

    return this.createMembers([member], registryCodeValue, schemeCodeValue, extensionCodeValue).pipe(map(createdMembers => {
      if (createdMembers.length !== 1) {
        throw new Error('Exactly one member needs to be created');
      } else {
        return createdMembers[0];
      }
    }));
  }

  createMembers(memberList: MemberType[],
                registryCodeValue: string,
                schemeCodeValue: string,
                extensionCodeValue: string): Observable<Member[]> {

    return this.http.post<WithResults<MemberType>>(`${codeRegistriesIntakeBasePath}/${registryCodeValue}/${codeSchemes}/${schemeCodeValue}/` +
      `${extensions}/${extensionCodeValue}/${members}/`,
      memberList)
      .pipe(map(res => res.results.map(data => new Member(data))));
  }

  createMissingMembers(registryCodeValue: string,
                       codeSchemeId: string,
                       extensionCodeValue: string): Observable<Member[]> {

    const theUrl = `${codeRegistriesIntakeBasePath}/${registryCodeValue}/${codeSchemes}/${codeSchemeId}/` +
      `${extensions}/${extensionCodeValue}/${members}/createmissing/`;

    return this.http.post<WithResults<MemberType>>(theUrl, null)
      .pipe(map(res => res.results.map(data => new Member(data))));
  }

  externalReferenceExists(registryCodeValue: string, schemeCodeValue: string, href: string): Observable<boolean> {

    const encodedHref = encodeURIComponent(href);

    return this.http.head(`${codeRegistriesIntakeBasePath}/${registryCodeValue}/${codeSchemes}/${schemeCodeValue}/${externalReferences}/?href=${encodedHref}`, { observe: 'response' })
      .pipe(
        map(res => res.status === 200),
        catchError(err => of(false))
      );
  }

  registryCodeValueExists(registryCodeValue: string): Observable<boolean> {

    return this.http.head(`${codeRegistriesIntakeBasePath}/${registryCodeValue}`, { observe: 'response' })
      .pipe(
        map(res => res.status === 200),
        catchError(err => of(false))
      );
  }

  codeSchemeCodeValueExists(registryCodeValue: string, schemeCodeValue: string): Observable<boolean> {

    return this.http.head(`${codeRegistriesIntakeBasePath}/${registryCodeValue}/${codeSchemes}/${schemeCodeValue}`, { observe: 'response' })
      .pipe(
        map(res => res.status === 200),
        catchError(err => of(false))
      );
  }

  codeCodeValueExists(registryCodeValue: string, schemeCodeValue: string, codeCodeValue: string): Observable<boolean> {

    const encodedCodeCodeValue = this.resolveCodeCodeValue(codeCodeValue);
    return this.http.head(
      `${codeRegistriesIntakeBasePath}/${registryCodeValue}/${codeSchemes}/${schemeCodeValue}/${codes}/${encodedCodeCodeValue}`, { observe: 'response' })
      .pipe(
        map(res => res.status === 200),
        catchError(err => of(false))
      );
  }

  extensionCodeValueExists(registryCodeValue: string,
                           schemeCodeValue: string,
                           extensionCodeValue: string): Observable<boolean> {

    const encodedExtensionCodeValue = encodeURIComponent(extensionCodeValue);
    return this.http.head(
      `${codeRegistriesIntakeBasePath}/${registryCodeValue}/${codeSchemes}/${schemeCodeValue}/${extensions}/` +
      `${encodedExtensionCodeValue}`, { observe: 'response' })
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

  suggestAConcept(suggeztion: string, definition: string, terminologyUri: string, contentLanguage: string): Observable<Concept[]> {

    const params = {
      'contentLanguage': contentLanguage,
      'suggestion': suggeztion,
      'terminologyUri': terminologyUri,
      'definition': definition
    };

    return this.http.post<WithResults<ConceptType>>(`${terminologyConceptSuggestionPath}`, null, { params })
      .pipe(map(res => res.results.map((data: ConceptType) => new Concept(data))));
  }

  findUserForCodeRegistry(codeRegistryId: string): Observable<UserSimple | null> {

    const params = {
      'expand': 'user',
      'codeRegistryId': codeRegistryId
    };

    return this.http.get<UserSimpleType>(
      `${usersIntakeBasePath}/${user}`,
      { params })
      .pipe(map(res => new UserSimple(res)),
        catchError(err => of(null)));
  }

  findUserForCodeScheme(codeSchemeId: string): Observable<UserSimple | null> {

    const params = {
      'expand': 'user',
      'codeSchemeId': codeSchemeId
    };

    return this.http.get<UserSimpleType>(
      `${usersIntakeBasePath}/${user}`,
      { params })
      .pipe(map(res => new UserSimple(res)),
        catchError(err => of(null)));
  }

  findUserForCode(codeId: string): Observable<UserSimple | null> {

    const params = {
      'expand': 'user',
      'codeId': codeId
    };

    return this.http.get<UserSimpleType>(
      `${usersIntakeBasePath}/${user}`,
      { params })
      .pipe(map(res => new UserSimple(res)),
        catchError(err => of(null)));
  }

  findUserForExtension(extensionId: string): Observable<UserSimple | null> {

    const params = {
      'expand': 'user',
      'extensionId': extensionId
    };

    return this.http.get<UserSimpleType>(
      `${usersIntakeBasePath}/${user}`,
      { params })
      .pipe(map(res => new UserSimple(res)),
        catchError(err => of(null)));
  }

  findUserForMember(memberId: string): Observable<UserSimple | null> {

    const params = {
      'expand': 'user',
      'memberId': memberId
    };

    return this.http.get<UserSimpleType>(
      `${usersIntakeBasePath}/${user}`,
      { params })
      .pipe(map(res => new UserSimple(res)),
        catchError(err => of(null)));
  }

  resolveCodeCodeValue(codeCodeValue: string): string {
    if (codeCodeValue === '.') {
      return 'U+002E';
    } else if (codeCodeValue === '..') {
      return 'U+002EU+002E';
    }
    return encodeURIComponent(codeCodeValue).replace('#', '%23');
  }
}
