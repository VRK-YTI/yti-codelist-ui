import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {ResolveEnd, Route, Router, RouterModule, Routes, UrlSegment, UrlSegmentGroup} from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {
  MissingTranslationHandler,
  MissingTranslationHandlerParams,
  TranslateLoader,
  TranslateModule
} from '@ngx-translate/core';
import { AppComponent } from './components/app.component';
import { FrontpageComponent } from './components/frontpage/frontpage.component';
import { LanguageService } from './services/language.service';
import { NavigationBarComponent } from './components/navigation/navigation-bar.component';
import { LocationService } from './services/location.service';
import { CodeSchemeComponent } from './components/codescheme/code-scheme.component';
import { CodeComponent } from './components/code/code.component';
import { DataService } from './services/data.service';
import { StyleTestComponent } from './components/style-test.component';
import { ContentLanguageComponent } from './components/common/content-language.component';
import { CodeSchemeCodesComponent } from './components/codescheme/code-scheme-codes.component';
import { CodeSchemeInformationComponent } from './components/codescheme/code-scheme-information.component';
import { CodeInformationComponent } from './components/code/code-information.component';
import { LocalizableInputComponent } from './components/form/localizable-input';
import { LocalizableTextareaComponent } from './components/form/localizable-textarea';
import { LiteralInputComponent } from './components/form/literal-input';
import { LinkComponent } from './components/form/link';
import { LiteralComponent } from './components/form/literal';
import { LocalizableLiteralComponent } from './components/form/localizable-literal';
import { EditableButtonsComponent } from './components/form/editable-buttons.component';
import { ErrorMessagesComponent } from './components/form/error-messages.component';
import { CodeListConfirmationModalService } from './components/common/confirmation-modal.service';
import { EditGuard } from './components/common/edit.guard';
import { AuthorizationManager } from './services/authorization-manager.service';
import { LinkListModalComponent, LinkListModalService } from './components/codescheme/link-list-modal.component';
import { LinkEditModalComponent, LinkEditModalService } from './components/codescheme/link-edit-modal.component';
import { LinkCreateModalComponent, LinkCreateModalService } from './components/codescheme/link-create-modal.component';
import { LinkShowModalComponent, LinkShowModalService } from './components/codescheme/link-show-modal.component';
import { PropertyTypeSelectComponent } from './components/codescheme/property-type-select.component';
import { CodeSchemeImportAndCreateComponent } from './components/codescheme/code-scheme-import-and-create.component';
import {
  CodeSchemeImportModalComponent,
  CodeSchemeImportModalService
} from './components/codescheme/code-scheme-import-modal.component';
import {
  CodeSchemeCodesImportModalComponent,
  CodeSchemeCodesImportModalService
} from './components/codescheme/code-scheme-codes-import-modal.component';
import { AUTHENTICATED_USER_ENDPOINT, LOCALIZER, YtiCommonModule } from 'yti-common-ui';
import { CodeSchemeCreateComponent } from './components/codescheme/code-scheme-create.component';
import { CodeCreateComponent } from './components/code/code-create.component';
import { UserDetailsComponent } from './components/user-details/user-details.component';
import { InformationAboutServiceComponent } from './components/information/information-about-service.component';
import { ModalService } from './services/modal.service';
import { ExternalReferencesInputComponent } from './components/form/external-references-input.component';
import { StatusInputComponent } from './components/form/status-input.component';
import { DateInputComponent } from './components/form/date-input.component';
import { ClassificationsInputComponent } from './components/form/classifications-input.component';
import {
  SearchLinkedCodeModalComponent,
  SearchLinkedCodeModalService
} from './components/form/search-linked-code-modal.component';
import { RegistryInputComponent } from './components/form/coderegistry-input.component';
import { DateRangeInputComponent } from './components/form/date-range-input.component';
import { CodeListErrorModalService } from './components/common/error-modal.service';
import { HierarchyCodeComponent } from './components/code/hierarchy-code.component';
import {
  TerminologyIntegrationCodeschemeModalComponent,
  TerminologyIntegrationModalService
} from './components/terminology-integration/terminology-integration-codescheme-modal.component';
import { EditableService } from './services/editable.service';
import { LazyForModule } from 'angular-lazy-for/dist/lazyFor.module';
import { CodeInputComponent } from './components/form/code-input.component';
import { ClipboardComponent } from './components/form/clipboard';
import { ClipboardModule } from 'ngx-clipboard';
import { CodeSchemeExtensionSchemesComponent } from './components/codescheme/code-scheme-extensionschemes.component';
import { ExtensionSchemeCreateComponent } from './components/extensionscheme/extension-scheme-create.component';
import { ExtensionSchemeComponent } from './components/extensionscheme/extension-scheme.component';
import { ExtensionSchemeInformationComponent } from './components/extensionscheme/extension-scheme-information.component';
import { ExtensionSchemeExtensionsComponent } from './components/extensionscheme/extension-scheme-extensions.component';
import { ExtensionInformationComponent } from './components/extension/extension-information.component';
import { ExtensionCreateComponent } from './components/extension/extension-create.component';
import { ExtensionSchemeListitemComponent } from './components/extensionscheme/extension-scheme-listitem.component';
import {
  ExtensionSchemeExtensionsImportModalService,
  ExtensionsImportModalComponent
} from './components/extension/extension-import-modal.component';
import {
  ExtensionSchemesImportModalComponent,
  ExtensionSchemesImportModalService
} from './components/extensionscheme/extension-scheme-import-modal.component';
import { ExtensionListitemComponent } from './components/extension/extension-listitem.component';
import { ExtensionComponent } from './components/extension/extension.component';
import {
  SearchLinkedExtensionModalComponent,
  SearchLinkedExtensionModalService
} from './components/form/search-linked-extension-modal.component';
import { ExtensionInputComponent } from './components/form/extension-input-component';
import { LogoComponent } from './components/navigation/logo.component';
import { RegistryListitemComponent } from './components/registry/registry-listitem';
import { RegistriesComponent } from './components/registry/registries.component';
import { RegistryComponent } from './components/registry/registry.component';
import { RegistryInformationComponent } from './components/registry/registry-information.component';
import { RegistryCodeSchemesComponent } from './components/registry/registry-code-schemes.component';
import {
  SearchLinkedOrganizationModalComponent,
  SearchLinkedOrganizationModalService
} from './components/form/search-linked-organization-modal.component';
import { OrganizationsInputComponent } from './components/form/organizations-input.component';
import { RegistryCreateComponent } from './components/registry/registry-create.component';
import { CodeSchemeVersionsComponent } from './components/codescheme/code-scheme-versions.component';
import { CodeSchemeVariantsComponent } from './components/codescheme/code-scheme-variants.component';
import { CodeSchemeVariantMothersComponent } from './components/codescheme/code-scheme-variant-mothers.component';

import {
  CodeschemeVariantModalComponent,
  CodeschemeVariantModalService
} from './components/codeschemevariant/codescheme-variant.modal.component';
import { CodeSchemeInputComponent } from './components/form/code-scheme-input.component';
import {
  SearchLinkedCodeSchemeModalComponent,
  SearchLinkedCodeSchemeModalService
} from './components/form/search-linked-code-scheme-modal.component';
import { of } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';
import {RefreshComponent} from './components/refresh.component';

function removeEmptyValues(obj: {}) {

  const result: any = {};

  for (const [key, value] of Object.entries(obj)) {
    if (!!value) {
      result[key] = value;
    }
  }

  return result;
}

const localizations: { [lang: string]: any } = {
  fi: {
    ...removeEmptyValues(JSON.parse(require(`raw-loader!po-loader?format=mf!../../po/fi.po`))),
    ...removeEmptyValues(JSON.parse(require(`raw-loader!po-loader?format=mf!yti-common-ui/po/fi.po`)))
  },
  en: {
    ...removeEmptyValues(JSON.parse(require(`raw-loader!po-loader?format=mf!../../po/en.po`))),
    ...removeEmptyValues(JSON.parse(require(`raw-loader!po-loader?format=mf!yti-common-ui/po/en.po`)))
  }
};

const appRoutes: Routes = [
  {path: '', component: FrontpageComponent, pathMatch: 'full'},
  {path: 'frontpage', redirectTo: '/', pathMatch: 'full'},
  {path: 'createcode', component: CodeCreateComponent, pathMatch: 'full'},
  {path: 'createcodescheme', component: CodeSchemeCreateComponent, pathMatch: 'full'},
  {path: 'createextensionscheme', component: ExtensionSchemeCreateComponent, pathMatch: 'full'},
  {path: 'createextension', component: ExtensionCreateComponent, pathMatch: 'full'},
  {path: 'createregistry', component: RegistryCreateComponent, pathMatch: 'full'},
  {path: 'importandcreatecodescheme', component: CodeSchemeImportAndCreateComponent, pathMatch: 'full'},
  {path: 'codescheme', component: CodeSchemeComponent, pathMatch: 'full', canDeactivate: [EditGuard]},
  {path: 'code', component: CodeComponent, pathMatch: 'full', canDeactivate: [EditGuard]},
  {path: 'extensionscheme', component: ExtensionSchemeComponent, pathMatch: 'full', canDeactivate: [EditGuard]},
  {path: 'member', component: ExtensionComponent, pathMatch: 'full', canDeactivate: [EditGuard]},
  {path: 'styles', component: StyleTestComponent},
  {path: 'userDetails', component: UserDetailsComponent},
  {path: 'information', component: InformationAboutServiceComponent},
  {path: 'registries', component: RegistriesComponent, pathMatch: 'full'},
  {path: 'registry', component: RegistryComponent, pathMatch: 'full'},
  // NOTE: If createRefreshRouteMatcher(['re']) starts to work after angular upgrade, then switch to that.
  { matcher: refreshRouteMatcher, component: RefreshComponent }
];

export function refreshRouteMatcher(segments: UrlSegment[], group: UrlSegmentGroup, route: Route) {
  if (segments.length >= 1 && segments[0].path === 're') {
    return {
      consumed: segments
    };
  }
  return {
    consumed: []
  };
}

export function resolveAuthenticatedUserEndpoint() {
  return '/codelist-intake/api/authenticated-user';
}

export function createTranslateLoader(): TranslateLoader {
  return { getTranslation: (lang: string) => of(localizations[lang]) };
}

export function createMissingTranslationHandler(): MissingTranslationHandler {
  return {
    handle: (params: MissingTranslationHandlerParams) => {
      if (params.translateService.currentLang === 'en') {
        return params.key;
      } else {
        return '[MISSING]: ' + params.key;
      }
    }
  };
}

@NgModule({
  declarations: [
    AppComponent,
    FrontpageComponent,
    NavigationBarComponent,
    CodeSchemeComponent,
    CodeComponent,
    CodeCreateComponent,
    ClipboardComponent,
    ContentLanguageComponent,
    CodeSchemeCodesComponent,
    ExtensionSchemeComponent,
    ExtensionComponent,
    CodeSchemeExtensionSchemesComponent,
    ExtensionSchemeInformationComponent,
    ExtensionSchemeExtensionsComponent,
    ExtensionInformationComponent,
    ExtensionCreateComponent,
    ExtensionSchemeListitemComponent,
    RegistriesComponent,
    RegistryCreateComponent,
    RegistryComponent,
    RegistryInformationComponent,
    RegistryListitemComponent,
    RegistryCodeSchemesComponent,
    ExtensionListitemComponent,
    CodeSchemeInformationComponent,
    CodeSchemeImportAndCreateComponent,
    CodeInformationComponent,
    CodeSchemeCodesImportModalComponent,
    CodeSchemeImportModalComponent,
    CodeSchemeCreateComponent,
    ExtensionSchemeCreateComponent,
    ExtensionsImportModalComponent,
    ExtensionSchemesImportModalComponent,
    LocalizableInputComponent,
    LocalizableTextareaComponent,
    LiteralInputComponent,
    LiteralComponent,
    LinkComponent,
    LocalizableLiteralComponent,
    EditableButtonsComponent,
    ErrorMessagesComponent,
    LinkShowModalComponent,
    LinkEditModalComponent,
    LinkCreateModalComponent,
    LinkListModalComponent,
    PropertyTypeSelectComponent,
    StyleTestComponent,
    UserDetailsComponent,
    InformationAboutServiceComponent,
    ExternalReferencesInputComponent,
    StatusInputComponent,
    DateInputComponent,
    DateRangeInputComponent,
    ClassificationsInputComponent,
    OrganizationsInputComponent,
    CodeInputComponent,
    CodeSchemeInputComponent,
    ExtensionInputComponent,
    SearchLinkedOrganizationModalComponent,
    SearchLinkedCodeModalComponent,
    SearchLinkedCodeSchemeModalComponent,
    SearchLinkedExtensionModalComponent,
    RegistryInputComponent,
    HierarchyCodeComponent,
    TerminologyIntegrationCodeschemeModalComponent,
    LogoComponent,
    CodeSchemeVersionsComponent,
    CodeSchemeVariantsComponent,
    CodeSchemeVariantMothersComponent,
    CodeschemeVariantModalComponent,
    RefreshComponent
  ],
  entryComponents: [ // needed for modal components
    CodeSchemeImportModalComponent,
    CodeSchemeCodesImportModalComponent,
    ExtensionSchemesImportModalComponent,
    ExtensionsImportModalComponent,
    LinkShowModalComponent,
    LinkEditModalComponent,
    LinkCreateModalComponent,
    LinkListModalComponent,
    SearchLinkedOrganizationModalComponent,
    SearchLinkedCodeModalComponent,
    SearchLinkedCodeSchemeModalComponent,
    SearchLinkedExtensionModalComponent,
    TerminologyIntegrationCodeschemeModalComponent,
    CodeschemeVariantModalComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(appRoutes),
    NgbModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader
      },
      missingTranslationHandler: { provide: MissingTranslationHandler, useFactory: createMissingTranslationHandler },
    }),
    YtiCommonModule,
    LazyForModule,
    ClipboardModule
  ],
  providers: [
    {provide: AUTHENTICATED_USER_ENDPOINT, useFactory: resolveAuthenticatedUserEndpoint},
    {provide: LOCALIZER, useExisting: LanguageService},
    LanguageService,
    LocationService,
    DataService,
    EditGuard,
    AuthorizationManager,
    CodeSchemeImportModalService,
    CodeSchemeCodesImportModalService,
    ExtensionSchemeExtensionsImportModalService,
    ExtensionSchemesImportModalService,
    CodeListConfirmationModalService,
    LinkShowModalService,
    LinkEditModalService,
    LinkCreateModalService,
    LinkListModalService,
    ModalService,
    SearchLinkedOrganizationModalService,
    SearchLinkedCodeModalService,
    SearchLinkedCodeSchemeModalService,
    SearchLinkedExtensionModalService,
    CodeListErrorModalService,
    TerminologyIntegrationModalService,
    TerminologyIntegrationCodeschemeModalComponent,
    CodeschemeVariantModalService,
    EditableService,
    NgbActiveModal
  ],
  bootstrap: [AppComponent]
})
export class AppModule {

  constructor(router: Router,
              modalService: ModalService) {

    router.events.subscribe(event => {
      if (event instanceof ResolveEnd) {
        modalService.closeAllModals();
      }
    });
  }
}
