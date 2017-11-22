import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
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
import { BreadcrumbComponent } from './components/navigation/breadcrumb.component';
import { FooterComponent } from './components/navigation/footer.component';
import { TranslateValuePipe } from './pipes/translate-value.pipe';
import { LocationService } from './services/location.service';
import { Observable } from 'rxjs/Observable';
import { CodeSchemeComponent } from './components/codescheme/code-scheme.component';
import { CodeComponent } from './components/code/code.component';
import { DataService } from './services/data.service';
import { LogoComponent } from './components/common/logo.component';
import { BackButtonComponent } from './components/common/back-button.component';
import { StyleTestComponent } from './components/style-test.component';
import { StatusComponent } from './components/common/status.component';
import { ContentLanguageComponent } from './components/common/content-language.component';
import { CodeSchemeCodesComponent } from './components/codescheme/code-scheme-codes.component';
import { CodeSchemeInformationComponent } from './components/codescheme/code-scheme-information.component';
import { CodeInformationComponent } from './components/code/code-information.component';
import { LocalizableInputComponent } from './components/form/localizable-input';
import { LocalizableTextareaComponent } from './components/form/localizable-textarea';
import { LiteralInputComponent } from './components/form/literal-input';
import { LiteralComponent } from './components/form/literal';
import { LocalizableLiteralComponent } from './components/form/localizable-literal';
import { AjaxLoadingIndicatorComponent } from './components/common/ajax-loading-indicator.component';
import { AjaxLoadingIndicatorSmallComponent } from './components/common/ajax-loading-indicator-small.component';
import { EditableButtonsComponent } from './components/form/editable-buttons.component';
import { ErrorMessagesComponent } from './components/form/error-messages.component';
import { ErrorModalComponent, ErrorModalService } from './components/common/error-modal.component';
import { ConfirmationModalComponent, ConfirmationModalService } from './components/common/confirmation-modal.component';
import { EditGuard } from './components/common/edit.guard';
import { UserService } from './services/user.service';
import { AuthorizationManager } from './services/authorization-manager.service';
import { LoginModalComponent, LoginModalService } from './components/navigation/login-modal.component';
import { LinkListModalComponent, LinkListModalService } from './components/codescheme/link-list-modal.component';
import { LinkEditModalComponent, LinkEditModalService } from './components/codescheme/link-edit-modal.component';
import { LinkCreateModalComponent, LinkCreateModalService } from './components/codescheme/link-create-modal.component';
import { LinkShowModalComponent, LinkShowModalService } from './components/codescheme/link-show-modal.component';

const localizations: { [lang: string]: string } = {
  fi: require('json-loader!po-loader?format=mf!../../po/fi.po'),
  en: require('json-loader!po-loader?format=mf!../../po/en.po')
};

const appRoutes: Routes = [
  {path: '', redirectTo: '/frontpage', pathMatch: 'full'},
  {path: 'frontpage', component: FrontpageComponent, pathMatch: 'full'},
  {path: 'codescheme', component: CodeSchemeComponent, pathMatch: 'full', canDeactivate: [EditGuard]},
  {path: 'code', component: CodeComponent, pathMatch: 'full', canDeactivate: [EditGuard]},
  {path: 'styles', component: StyleTestComponent}
];

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
    BreadcrumbComponent,
    FooterComponent,
    TranslateValuePipe,
    CodeSchemeComponent,
    CodeComponent,
    LogoComponent,
    BackButtonComponent,
    StatusComponent,
    ContentLanguageComponent,
    CodeSchemeCodesComponent,
    CodeSchemeInformationComponent,
    CodeInformationComponent,
    LocalizableInputComponent,
    LocalizableTextareaComponent,
    LiteralInputComponent,
    LiteralComponent,
    LocalizableLiteralComponent,
    AjaxLoadingIndicatorComponent,
    AjaxLoadingIndicatorSmallComponent,
    EditableButtonsComponent,
    ErrorMessagesComponent,
    ErrorModalComponent,
    ConfirmationModalComponent,
    LoginModalComponent,
    LinkShowModalComponent,
    LinkEditModalComponent,
    LinkCreateModalComponent,
    LinkListModalComponent,
    StyleTestComponent
  ],
  entryComponents: [ // needed for modal components
    ErrorModalComponent,
    ConfirmationModalComponent,
    LoginModalComponent,
    LinkShowModalComponent,
    LinkEditModalComponent,
    LinkCreateModalComponent,
    LinkListModalComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(appRoutes),
    NgbModule.forRoot(),
    TranslateModule.forRoot({provide: TranslateLoader, useFactory: createTranslateLoader})
  ],
  providers: [
    {provide: MissingTranslationHandler, useFactory: createMissingTranslationHandler},
    LanguageService,
    LocationService,
    DataService,
    EditGuard,
    ErrorModalService,
    LoginModalService,
    ConfirmationModalService,
    UserService,
    AuthorizationManager,
    ConfirmationModalService,
    LinkShowModalService,
    LinkEditModalService,
    LinkCreateModalService,
    LinkListModalService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
