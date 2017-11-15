import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {
  TranslateModule, TranslateLoader, MissingTranslationHandler,
  MissingTranslationHandlerParams
} from 'ng2-translate';
import { AppComponent } from './components/app.component';
import { FrontpageComponent } from './components/frontpage/frontpage.component';
import { LanguageService } from './services/language.service';
import { NavigationBarComponent } from './components/navigation-bar.component';
import { BreadcrumbComponent } from './components/breadcrumb.component';
import { FooterComponent } from './components/footer.component';
import { TranslateValuePipe } from './pipes/translate-value.pipe';
import { LocationService } from './services/location.service';
import { Observable } from 'rxjs/Observable';
import { CodeSchemeComponent } from './components/codescheme/codescheme.component';
import { CodeComponent } from './components/code/code.component';
import { DataService } from './services/data.service';
import { LogoComponent } from './components/logo.component';
import { BackButtonComponent } from './components/back-button.component';
import { StyleTestComponent } from './components/style-test.component';
import { StatusComponent } from './components/status.component';
import { ContentLanguageComponent } from './components/content-language.component';

const localizations: { [lang: string]: string} = {
  fi: require('json-loader!po-loader?format=mf!../../po/fi.po'),
  en: require('json-loader!po-loader?format=mf!../../po/en.po')
};

const appRoutes: Routes = [
  { path: '', redirectTo: '/frontpage', pathMatch: 'full' },
  { path: 'frontpage', component: FrontpageComponent, pathMatch: 'full' },
  { path: 'codescheme', component: CodeSchemeComponent, pathMatch: 'full' },
  { path: 'code', component: CodeComponent, pathMatch: 'full' },
  { path: 'styles', component: StyleTestComponent }
];

export function createTranslateLoader(): TranslateLoader {
  return { getTranslation: (lang: string) => Observable.of(localizations[lang]) };
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
    StyleTestComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(appRoutes),
    NgbModule.forRoot(),
    TranslateModule.forRoot({ provide: TranslateLoader, useFactory: createTranslateLoader })
  ],
  providers: [
    { provide: MissingTranslationHandler, useFactory: createMissingTranslationHandler },
    LanguageService,
    LocationService,
    DataService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
