import { Component, OnInit, ViewChild } from '@angular/core';
import { CodeScheme } from '../../entities/code-scheme';
import { DataService } from '../../services/data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LocationService } from '../../services/location.service';
import { EditableService, EditingComponent } from '../../services/editable.service';
import { NgbTabChangeEvent, NgbTabset } from '@ng-bootstrap/ng-bootstrap';
import { ignoreModalClose } from 'yti-common-ui//utils/modal';
import { LanguageService } from '../../services/language.service';
import { CodePlain } from '../../entities/code-simple';
import { UserService } from 'yti-common-ui/services/user.service';
import { CodeListConfirmationModalService } from '../common/confirmation-modal.service';
import { CodeListErrorModalService } from '../common/error-modal.service';
import { AuthorizationManager } from '../../services/authorization-manager.service';
import { Extension } from '../../entities/extension';
import { ExtensionImportModalService } from '../extension/extension-import-modal.component';
import { CodeSchemeListItem } from '../../entities/code-scheme-list-item';
import { comparingLocalizable } from 'yti-common-ui/utils/comparator';
import { CodeschemeVariantModalService } from '../codeschemevariant/codescheme-variant.modal.component';
import { switchMap, tap } from 'rxjs/operators';
import { from, Observable } from 'rxjs';
import { CodeSchemeCodesImportModalService } from './code-scheme-codes-import-modal.component';
import {
  changeToRestrictedStatus,
  isCodeSchemeStatusGettingChangedValidlySoThatWeNeedToAskDoCodesStatusesUpdatedToo
} from '../../utils/status-check';
import { CodeSchemeImportModalService } from './code-scheme-import-modal.component';
import { ExtensionSimple } from '../../entities/extension-simple';
import { CodeSchemeMassMigrateCodeStatusesModalService } from './code-scheme-mass-migrate-code-statuses-modal.component';
import { TranslateService } from '@ngx-translate/core';
import { ApiResponseType } from '../../services/api-schema';
import { AlertModalService } from '../common/alert-modal.service';
import { MessagingService } from '../../services/messaging-service';
import { ConfigurationService } from '../../services/configuration.service';

@Component({
  selector: 'app-code-scheme',
  templateUrl: './code-scheme.component.html',
  styleUrls: ['./code-scheme.component.scss'],
  providers: [EditableService]
})
export class CodeSchemeComponent implements OnInit, EditingComponent {

  @ViewChild('tabSet') tabSet: NgbTabset;

  codeScheme: CodeScheme;
  previouslySavedCodeScheme: CodeScheme | undefined; // every time we just before saving, CS as it was last read from ES index goes here
  codes: CodePlain[];
  extensions: Extension[];
  chosenVariant: CodeScheme;
  forbiddenVariantSearchResultIds: string[] = [];
  deleting = false;
  languageCodes: CodePlain[] | null;
  deleteCodeSchemeButtonTitle = 'Delete code list';
  prefilledSearchTermForCode: string;
  initialTabId: string | undefined = undefined;
  hasSubscription: boolean | undefined = undefined;
  changeCodeStatusesAsWellWhenSavingCodeScheme = false;

  constructor(private userService: UserService,
              private dataService: DataService,
              private messagingService: MessagingService,
              private configurationService: ConfigurationService,
              private route: ActivatedRoute,
              private router: Router,
              private locationService: LocationService,
              public languageService: LanguageService,
              public translateService: TranslateService,
              private editableService: EditableService,
              private confirmationModalService: CodeListConfirmationModalService,
              private extensionsImportModalService: ExtensionImportModalService,
              private errorModalService: CodeListErrorModalService,
              private authorizationManager: AuthorizationManager,
              private codeschemeVariantModalService: CodeschemeVariantModalService,
              private codeSchemeCodesImportModalService: CodeSchemeCodesImportModalService,
              private codeSchemeImportModalService: CodeSchemeImportModalService,
              private codeSchemeMassMigrateCodeStatusesModalService: CodeSchemeMassMigrateCodeStatusesModalService,
              private activatedRoute: ActivatedRoute,
              private alertModalService: AlertModalService) {

    editableService.onSave = (formValue: any) => this.save(formValue);
  }

  ngOnInit() {
    this.doTheInit();
  }

  doTheInit(weJustSaved?: boolean, codeSchemeThatWeTriedToSave?: CodeScheme) {
    const registryCodeValue = this.route.snapshot.params.registryCode;
    const schemeCodeValue = this.route.snapshot.params.schemeCode;

    this.activatedRoute.queryParams.subscribe(params => {
      this.initialTabId = params['activeTab'];
    });

    if (!registryCodeValue || !schemeCodeValue) {
      throw new Error(`Illegal route, registry: '${registryCodeValue}', scheme: '${schemeCodeValue}'`);
    }

    this.dataService.getCodeScheme(registryCodeValue, schemeCodeValue).subscribe(codeScheme => {
      this.codeScheme = codeScheme;
      this.checkSubscription();
      this.codeScheme.variantsOfThisCodeScheme.sort(comparingLocalizable<CodeSchemeListItem>(this.languageService, item =>
        item.prefLabel ? item.prefLabel : {}));
      this.locationService.atCodeSchemePage(codeScheme);
      if (this.codeScheme.allVersions.length > 0) {
        this.deleteCodeSchemeButtonTitle = 'Delete code list version';
      }

      if (weJustSaved && codeSchemeThatWeTriedToSave && this.previouslySavedCodeScheme) {
        const originalCodeSchemeInTheDatabase = this.previouslySavedCodeScheme;
        const codeSchemeAfterTheUpdate = this.codeScheme;
        const codeSchemeTheUserTriedToSave = codeSchemeThatWeTriedToSave;

        const languagesThatActuallyGotDeleted: CodePlain[] = [];
        originalCodeSchemeInTheDatabase.languageCodes.forEach(lang => {
          let found = false;
          codeSchemeAfterTheUpdate.languageCodes.forEach(innerLang => {
            if (lang.codeValue === innerLang.codeValue) {
              found = true;
            }
          });
          if (!found) {
            languagesThatActuallyGotDeleted.push(lang);
          }
        });

        const languagesThatUserTriedToDelete: CodePlain[] = [];
        originalCodeSchemeInTheDatabase.languageCodes.forEach(lang => {
          let found = false;
          codeSchemeTheUserTriedToSave.languageCodes.forEach(innerLang => {
            if (lang.codeValue === innerLang.codeValue) {
              found = true;
            }
          });
          if (!found) {
            languagesThatUserTriedToDelete.push(lang);
          }
        });

        const languagesThatDidNotGetDeletedEvenThoughUserWanted: CodePlain[] = [];
        languagesThatUserTriedToDelete.forEach(lang => {
          let found = false;
          languagesThatActuallyGotDeleted.forEach(innerLang => {
            if (lang.codeValue === innerLang.codeValue) {
              found = true;
            }
          });
          if (!found) {
            languagesThatDidNotGetDeletedEvenThoughUserWanted.push(lang);
          }
        });

        if (languagesThatDidNotGetDeletedEvenThoughUserWanted.length > 0) {
          let languages = '';
          let count = 0;
          languagesThatDidNotGetDeletedEvenThoughUserWanted.forEach( lang => {
            const displayLang = lang.getDisplayName(this.languageService, true);
            if (count > 0) {
              languages = languages + ','  + displayLang;
            } else {
              languages = languages + displayLang;
            }
            count++;
          });
          const title = 'The following languages could not be removed due to usage';
          const modalRef = this.alertModalService.openWithMessageAndTitle(title, languages);
          modalRef.showOkButton = true;
        }
      }
    });

    this.dataService.getPlainCodes(registryCodeValue, schemeCodeValue).subscribe(codes => {
      this.codes = codes;
    });

    this.dataService.getExtensions(registryCodeValue, schemeCodeValue).subscribe(extensions => {
      this.extensions = extensions;
    });

    this.activatedRoute.queryParams.subscribe(params => {
      this.prefilledSearchTermForCode = params['prefilledSearchTermForCode'];
    });
  }

  checkSubscription() {

    if (this.isMessagingEnabled && !this.isAnonymous) {
      this.messagingService.getSubscription(this.codeScheme.uri).subscribe(resource => {
        if (resource) {
          this.hasSubscription = true;
        } else {
          this.hasSubscription = false;
        }
      });
    }
  }

  refreshCodesAndCodeScheme() {
    this.dataService.getPlainCodes(this.codeScheme.codeRegistry.codeValue, this.codeScheme.codeValue).subscribe(codes => {
      this.codes = codes;
      if (codes.length > 0) {
        this.tabSet.activeId = 'codelist_codes_tab';
      }
    });
    this.refreshCodeScheme();
  }

  refreshExtensionsAndCodeScheme() {
    this.dataService.getExtensions(this.codeScheme.codeRegistry.codeValue, this.codeScheme.codeValue).subscribe(extensions => {
      this.extensions = extensions;
    });
    this.refreshCodeScheme();
  }

  refreshCodeScheme() {
    this.dataService.getCodeScheme(this.codeScheme.codeRegistry.codeValue, this.codeScheme.codeValue).subscribe(codeScheme => {
      this.codeScheme = codeScheme;
    });
  }

  get loading(): boolean {
    return this.codeScheme == null ||
      this.codes == null ||
      this.extensions == null ||
      this.deleting ||
      (!this.isAnonymous && this.hasSubscription == null);
  }

  get contentLanguages(): CodePlain[] {
    if (this.languageCodes) {
      return this.languageCodes;
    } else {
      return this.codeScheme.languageCodes;
    }
  }

  onTabChange(event: NgbTabChangeEvent) {

    this.languageCodes = null;

    if (this.isEditing()) {
      event.preventDefault();

      this.confirmationModalService.openEditInProgress()
        .then(() => {
          this.cancelEditing();
          this.tabSet.activeId = event.nextId;
        }, ignoreModalClose);
    }
  }

  isEditing(): boolean {
    return this.editableService.editing;
  }

  delete() {
    this.confirmationModalService.openRemoveCodeScheme()
      .then(() => {
        this.deleting = true;
        this.dataService.deleteCodeScheme(this.codeScheme).subscribe(res => {
          if (res.meta.code === 200) {
            this.deleting = false;
            this.router.navigate(['frontpage']);
          } else {
            this.deleting = false;
            this.errorModalService.openSubmitError(res);
          }
        }, error => {
          this.deleting = false;
          this.errorModalService.openSubmitError(error);
        });
      }, ignoreModalClose);
  }

  get restricted(): boolean {
    if (this.isSuperUser) {
      return false;
    }
    return this.codeScheme.restricted;
  }

  cancelEditing(): void {
    this.editableService.cancel();
  }

  save(formData: any): Observable<any> {

    const { validity, ...rest } = formData;
    const updatedCodeScheme = this.codeScheme.clone();

    const nrOfLangsAtStart = updatedCodeScheme.languageCodes.length;

    Object.assign(updatedCodeScheme, {
      ...rest,
      startDate: validity.start,
      endDate: validity.end
    });

    let weNeedToAskAboutCodeStatuses: Boolean = false;
    if (isCodeSchemeStatusGettingChangedValidlySoThatWeNeedToAskDoCodesStatusesUpdatedToo(this.codeScheme.status, updatedCodeScheme.status)) {
      weNeedToAskAboutCodeStatuses = true;
    }

    const save = () => {
      this.previouslySavedCodeScheme = this.codeScheme;
      return this.dataService.saveCodeScheme(updatedCodeScheme.serialize(), 'false').pipe(tap(() => {
        this.doTheInit(true, updatedCodeScheme);
      }));
    };

    const saveWithCodeStatusChanges = () => {
      return this.dataService.saveCodeScheme(updatedCodeScheme.serialize(), 'true').pipe(tap((value) => {
        const response: ApiResponseType = value;
        const nrOfChangedCodes = response.meta.nonTranslatableMessage;
        const title = 'CODE STATUS CHANGES RESULTS';
        let message = '';
        if (nrOfChangedCodes === '0') {
          message = this.translateService.instant('No codes were found with the starting status. No changes to code statuses.');
        } else if (nrOfChangedCodes === '1') {
          message = this.translateService.instant('Status changed to one code.');
        } else {
          message = this.translateService.instant('Status changed to ') + nrOfChangedCodes +
            this.translateService.instant(' codes.');
        }
        this.alertModalService.openWithMessageAndTitle(title, message);
        this.doTheInit(true, updatedCodeScheme);
      }));
    };

    const startStatusLocalized: string = this.translateService.instant(this.codeScheme.status);
    const endStatusLocalized: string = this.translateService.instant(formData.status);

    if (changeToRestrictedStatus(this.codeScheme, formData.status)) {
      if (this.changeCodeStatusesAsWellWhenSavingCodeScheme && this.codes.length > 0) {
        return from(this.confirmationModalService.openChangeToRestrictedStatus()).pipe(
          switchMap(ok => from(this.confirmationModalService.openChangeCodeStatusesAlsoAlongWithTheCodeSchemeStatus(startStatusLocalized, endStatusLocalized)).pipe(
            switchMap(okok => saveWithCodeStatusChanges()))))
      } else {
        return from(this.confirmationModalService.openChangeToRestrictedStatus()).pipe(switchMap(ok => save()));
      }
    } else {
      if (this.changeCodeStatusesAsWellWhenSavingCodeScheme && this.codes.length > 0) {
        return from(this.confirmationModalService.openChangeCodeStatusesAlsoAlongWithTheCodeSchemeStatus(startStatusLocalized, endStatusLocalized)).pipe(
          switchMap(ok => saveWithCodeStatusChanges()))
      } else {
        return save();
      }
    }
  }

  navigateToRoute(route: any[]) {
    this.router.navigate(route);
  }

  importExtensions() {

    this.extensionsImportModalService.open(this.codeScheme).then(success => {
      if (success) {
        this.refreshExtensionsAndCodeScheme();
      }
    }, ignoreModalClose);
  }

  createExtension(propertyTypeLocalName: string) {

    this.router.navigate(
      ['createextension',
        {
          registryCode: this.codeScheme.codeRegistry.codeValue,
          schemeCode: this.codeScheme.codeValue,
          propertyTypeLocalName: propertyTypeLocalName
        }
      ]
    );
  }

  importCodes() {

    this.codeSchemeCodesImportModalService.open(this.codeScheme).then(success => {
      if (success) {
        this.refreshCodesAndCodeScheme();
      }
    }, ignoreModalClose);
  }

  createCode() {

    this.router.navigate(
      ['createcode',
        {
          registryCode: this.codeScheme.codeRegistry.codeValue,
          schemeCode: this.codeScheme.codeValue
        }
      ]
    );
  }

  get canSubscribe(): boolean {

    return this.configurationService.isMessagingEnabled && !this.userService.user.anonymous;
  }

  get canAddSubscription(): boolean {

    return this.canSubscribe && !this.hasSubscription;
  }

  get canRemoveSubscription(): boolean {

    return this.canSubscribe && this.hasSubscription === true;
  }

  addSubscription() {

    this.confirmationModalService.openAddSubscription()
      .then(() => {
        this.messagingService.addSubscription(this.codeScheme.uri, 'codelist').subscribe(success => {
          if (success) {
            this.hasSubscription = true;
          } else {
            this.hasSubscription = false;
            this.errorModalService.open('Submit error', 'Adding subscription failed.', null);
          }
        });
      }, ignoreModalClose);
  }

  removeSubscription() {

    this.confirmationModalService.openRemoveSubscription()
      .then(() => {
        this.messagingService.deleteSubscription(this.codeScheme.uri).subscribe(success => {
          if (success) {
            this.hasSubscription = false;
          } else {
            this.hasSubscription = true;
            this.errorModalService.open('Submit error', 'Subscription deletion failed.', null);
          }
        });
      }, ignoreModalClose);
  }

  get showMenu(): boolean {

    return this.canDeleteCodeScheme ||
      this.canAddExtension ||
      this.canCreateANewVersionFromCodeScheme ||
      this.canAttachOrDetachAVariant ||
      this.canAddCode ||
      this.canSubscribe
  }

  get canDeleteCodeScheme(): boolean {

    return this.authorizationManager.canDeleteCodeScheme(this.codeScheme);
  }

  get canAddExtension(): boolean {

    return this.authorizationManager.canEdit(this.codeScheme);
  }

  canAddExtensionWithType(propertyTypeLocalName: string): boolean {

    if (this.isCodeExtension(propertyTypeLocalName) && this.hasExtension(propertyTypeLocalName)) {
      return false;
    }
    return this.canAddExtension;
  }

  isCodeExtension(propertyTypeLocalName: string): boolean {

    const codeExtensionLocalNames: string[] = ['dpmMetric', 'dpmDimension', 'dpmExplicitDomain', 'dpmTypedDomain'];
    for (const extensionPropertyTypeLocalName of codeExtensionLocalNames) {
      if (propertyTypeLocalName === extensionPropertyTypeLocalName) {
        return true;
      }
    }
    return false;
  }

  hasExtension(propertyTypeLocalName: string): boolean {

    const extensions: ExtensionSimple[] = this.codeScheme.extensions ? this.codeScheme.extensions : [];
    for (const extension of extensions) {
      if (extension.propertyType.localName === propertyTypeLocalName) {
        return true;
      }
    }
    return false;
  }

  get canCreateANewVersionFromCodeScheme(): boolean {

    return !this.codeScheme.nextCodeschemeId &&
      this.codeScheme.status === 'VALID' &&
      this.authorizationManager.canEdit(this.codeScheme);
  }

  get canAttachOrDetachAVariant(): boolean {

    return this.authorizationManager.canEdit(this.codeScheme);
  }

  get isSuperUser(): boolean {

    return this.userService.user.superuser;
  }

  get canAddCode(): boolean {

    return this.authorizationManager.canEdit(this.codeScheme) && !this.codeScheme.restricted;
  }

  get isAnonymous(): boolean {

    return this.userService.user.anonymous;
  }

  createANewVersionFromThisCodeScheme() {

    this.router.navigate(['createcodescheme'], { queryParams: { 'originalCodeSchemeId': this.codeScheme.id } });
  }

  createANewVersionOfThisCodeSchemeFromFile() {

    this.codeSchemeImportModalService.open(true, false, this.codeScheme);
  }

  updateCodeSchemeFromFile() {

    this.codeSchemeImportModalService.open(false, true, this.codeScheme)
      .then(codeScheme => this.router.navigate(['re'], { skipLocationChange: true })).catch(reason => undefined)
      .then(() => this.router.navigate(this.codeScheme.route)).catch(reason => undefined);
  }

  massMigrateCodeListsCodesStatuses() {

    this.codeSchemeMassMigrateCodeStatusesModalService.open(this.codeScheme)
      .then(codeScheme => this.router.navigate(['re'], { skipLocationChange: true })).catch(reason => undefined)
      .then(() => this.router.navigate(this.codeScheme.route)).catch(reason => undefined);
  }

  reloadCodeScheme() {

    const registryCodeValue = this.route.snapshot.params.registryCode;
    const schemeCodeValue = this.route.snapshot.params.schemeCode;

    this.dataService.getCodeScheme(registryCodeValue, schemeCodeValue).subscribe(codeScheme => {
      this.codeScheme = codeScheme;
      this.codeScheme.variantsOfThisCodeScheme.sort(comparingLocalizable<CodeSchemeListItem>(this.languageService, item =>
        item.prefLabel ? item.prefLabel : {}));
      this.locationService.atCodeSchemePage(codeScheme);
    });
  }

  openVariantSearchModal() {

    this.codeScheme.variantsOfThisCodeScheme.forEach(variant => {
      this.forbiddenVariantSearchResultIds.push(variant.id);
    });
    this.codeScheme.allVersions.forEach(version => {
      this.forbiddenVariantSearchResultIds.push(version.id);
    });
    this.codeschemeVariantModalService.open(this.forbiddenVariantSearchResultIds)
      .then(codeScheme => this.putChosenVariantStuffInPlace(codeScheme), ignoreModalClose);
  }

  putChosenVariantStuffInPlace(chosenVariantCodeScheme: CodeScheme) {

    this.chosenVariant = chosenVariantCodeScheme;
    if (this.codeScheme.variantsOfThisCodeScheme.filter(variant => (variant.id === this.chosenVariant.id)).length > 0) {
      return; // stop user from attaching the same variant twice (would not mess DB but would mess the UI)
    }
    return this.dataService.attachAVariantToCodeScheme(this.codeScheme.codeRegistry, chosenVariantCodeScheme.id,
      this.codeScheme.serialize())
      .subscribe(resultCodeScheme => {
        if (this.codeScheme.variantsOfThisCodeScheme) {
          const theStart = this.chosenVariant.startDate ? this.chosenVariant.startDate.toISOString(true) : undefined;
          const theEnd = this.chosenVariant.endDate ? this.chosenVariant.endDate.toISOString(true) : undefined;
          this.codeScheme.variantsOfThisCodeScheme.push(
            new CodeSchemeListItem({
              id: this.chosenVariant.id,
              prefLabel: this.chosenVariant.prefLabel,
              codeValue: this.chosenVariant.codeValue,
              uri: this.chosenVariant.uri,
              startDate: theStart,
              endDate: theEnd,
              status: this.chosenVariant.status
            })
          );
        }
      });
  }

  changeLanguages(codes: CodePlain[]) {

    setTimeout(this.changeLanguagesAfterTimeout(codes), 0);
  }

  toggleChangeCodeStatusesAsWellWhenSavingCodeScheme(doItOrNot: boolean) {

    this.changeCodeStatusesAsWellWhenSavingCodeScheme = doItOrNot;
  }

  // timeout of one tick (see the caller) added to avoid ExpressionChangedAfterItHasBeenCheckedError
  changeLanguagesAfterTimeout(codes: CodePlain[]) {

    this.languageCodes = codes
  }

  isMessagingEnabled(): boolean {

    return this.configurationService.isMessagingEnabled;
  }
}
