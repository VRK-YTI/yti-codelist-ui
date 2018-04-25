import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ResolveEnd, Router, RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {
  MissingTranslationHandler,
  MissingTranslationHandlerParams,
  TranslateLoader,
  TranslateModule
} from 'ng2-translate';
import { AppComponent } from './components/app.component';
import { FrontpageComponent } from './components/frontpage/frontpage.component';
import { LanguageService } from './services/language.service';
import { NavigationBarComponent } from './components/navigation/navigation-bar.component';
import { LocationService } from './services/location.service';
import { Observable } from 'rxjs/Observable';
import { CodeSchemeComponent } from './components/codescheme/code-scheme.component';
import { CodeComponent } from './components/code/code.component';
import { DataService } from './services/data.service';
import { StyleTestComponent } from './components/style-test.component';
import { StatusComponent } from 'yti-common-ui/components/status.component';
import { ContentLanguageComponent } from './components/common/content-language.component';
import { CodeSchemeCodesComponent } from './components/codescheme/code-scheme-codes.component';
import { CodeSchemeInformationComponent } from './components/codescheme/code-scheme-information.component';
import { CodeInformationComponent } from './components/code/code-information.component';
import { LocalizableInputComponent } from './components/form/localizable-input';
import { LocalizableTextareaComponent } from './components/form/localizable-textarea';
import { LiteralInputComponent } from './components/form/literal-input';
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
import { CodeRegistryInputComponent } from './components/form/coderegistry-input.component';
import { DateRangeInputComponent } from './components/form/date-range-input.component';
import { CodeListErrorModalService } from './components/common/error-modal.service';
import { HierarchyCodeComponent } from './components/code/hierarchy-code.component';
import {
  TerminologyIntegrationCodeschemeModalComponent,
  TerminologyIntegrationModalService
} from './components/terminology-integration/terminology-integration-codescheme-modal.component';
import { EditableService } from './services/editable.service';
import { LazyForModule } from 'angular-lazy-for/dist/lazyFor.module';

const localizations: { [lang: string]: string } = {
  fi: Object.assign({},
    require('json-loader!po-loader?format=mf!../../po/fi.po'),
    require('json-loader!po-loader?format=mf!yti-common-ui/po/fi.po')
  )
  ,
  en: Object.assign({},
    require('json-loader!po-loader?format=mf!../../po/en.po'),
    require('json-loader!po-loader?format=mf!yti-common-ui/po/en.po')
  )
};

const appRoutes: Routes = [
  {path: '', component: FrontpageComponent, pathMatch: 'full'},
  {path: 'frontpage', redirectTo: '/', pathMatch: 'full'},
  {path: 'createcode', component: CodeCreateComponent, pathMatch: 'full'},
  {path: 'createcodescheme', component: CodeSchemeCreateComponent, pathMatch: 'full'},
  {path: 'importandcreatecodescheme', component: CodeSchemeImportAndCreateComponent, pathMatch: 'full'},
  {path: 'codescheme', component: CodeSchemeComponent, pathMatch: 'full', canDeactivate: [EditGuard]},
  {path: 'code', component: CodeComponent, pathMatch: 'full', canDeactivate: [EditGuard]},
  {path: 'styles', component: StyleTestComponent},
  {path: 'userDetails', component: UserDetailsComponent},
  {path: 'information', component: InformationAboutServiceComponent}
];

export function resolveAuthenticatedUserEndpoint() {
  return '/codelist-intake/api/authenticated-user';
}

export function createTranslateLoader(): TranslateLoader {
  return {getTranslation: (lang: string) => Observable.of(localizations[lang])};
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
    StatusComponent,
    ContentLanguageComponent,
    CodeSchemeCodesComponent,
    CodeSchemeInformationComponent,
    CodeSchemeImportAndCreateComponent,
    CodeInformationComponent,
    CodeSchemeCodesImportModalComponent,
    CodeSchemeImportModalComponent,
    CodeSchemeCreateComponent,
    LocalizableInputComponent,
    LocalizableTextareaComponent,
    LiteralInputComponent,
    LiteralComponent,
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
    SearchLinkedCodeModalComponent,
    CodeRegistryInputComponent,
    HierarchyCodeComponent,
    TerminologyIntegrationCodeschemeModalComponent
  ],
  entryComponents: [ // needed for modal components
    CodeSchemeImportModalComponent,
    CodeSchemeCodesImportModalComponent,
    LinkShowModalComponent,
    LinkEditModalComponent,
    LinkCreateModalComponent,
    LinkListModalComponent,
    SearchLinkedCodeModalComponent,
    TerminologyIntegrationCodeschemeModalComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(appRoutes),
    NgbModule.forRoot(),
    TranslateModule.forRoot({provide: TranslateLoader, useFactory: createTranslateLoader}),
    YtiCommonModule,
    LazyForModule
  ],
  providers: [
    {provide: AUTHENTICATED_USER_ENDPOINT, useFactory: resolveAuthenticatedUserEndpoint},
    {provide: LOCALIZER, useExisting: LanguageService},
    {provide: MissingTranslationHandler, useFactory: createMissingTranslationHandler},
    LanguageService,
    LocationService,
    DataService,
    EditGuard,
    AuthorizationManager,
    CodeSchemeImportModalService,
    CodeSchemeCodesImportModalService,
    CodeListConfirmationModalService,
    LinkShowModalService,
    LinkEditModalService,
    LinkCreateModalService,
    LinkListModalService,
    ModalService,
    SearchLinkedCodeModalService,
    CodeListErrorModalService,
    TerminologyIntegrationModalService,
    TerminologyIntegrationCodeschemeModalComponent,
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
