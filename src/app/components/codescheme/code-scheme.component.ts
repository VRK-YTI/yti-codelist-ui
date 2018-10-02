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
import { tap, flatMap } from 'rxjs/operators';
import { Observable, from } from 'rxjs';
import { CodeSchemeCodesImportModalService } from './code-scheme-codes-import-modal.component';
import { changeToRestrictedStatus } from '../../utils/status-check';

@Component({
  selector: 'app-code-scheme',
  templateUrl: './code-scheme.component.html',
  styleUrls: ['./code-scheme.component.scss'],
  providers: [EditableService],
})
export class CodeSchemeComponent implements OnInit, EditingComponent {

  @ViewChild('tabSet') tabSet: NgbTabset;

  codeScheme: CodeScheme;
  codes: CodePlain[];
  extensions: Extension[];
  env: string;
  chosenVariant: CodeScheme;
  forbiddenVariantSearchResultIds: string[] = [];
  deleting = false;
  languageCodes: CodePlain[] | null;

  constructor(private userService: UserService,
              private dataService: DataService,
              private route: ActivatedRoute,
              private router: Router,
              private locationService: LocationService,
              public languageService: LanguageService,
              private editableService: EditableService,
              private confirmationModalService: CodeListConfirmationModalService,
              private extensionsImportModalService: ExtensionImportModalService,
              private errorModalService: CodeListErrorModalService,
              private authorizationManager: AuthorizationManager,
              private codeschemeVariantModalService: CodeschemeVariantModalService,
              private codeSchemeCodesImportModalService: CodeSchemeCodesImportModalService) {

    editableService.onSave = (formValue: any) => this.save(formValue);
  }

  ngOnInit() {

    const registryCodeValue = this.route.snapshot.params.registryCode;
    const schemeCodeValue = this.route.snapshot.params.schemeCode;

    if (!registryCodeValue || !schemeCodeValue) {
      throw new Error(`Illegal route, registry: '${registryCodeValue}', scheme: '${schemeCodeValue}'`);
    }

    this.dataService.getServiceConfiguration().subscribe(configuration => {
      this.env = configuration.env;
    });

    this.dataService.getCodeScheme(registryCodeValue, schemeCodeValue).subscribe(codeScheme => {
      this.codeScheme = codeScheme;
      this.codeScheme.variantsOfThisCodeScheme.sort(comparingLocalizable<CodeSchemeListItem>(this.languageService, item =>
        item.prefLabel ? item.prefLabel : {}));
      this.locationService.atCodeSchemePage(codeScheme);
    });

    this.dataService.getPlainCodes(registryCodeValue, schemeCodeValue).subscribe(codes => {
      this.codes = codes;
    });

    this.dataService.getExtensions(registryCodeValue, schemeCodeValue).subscribe(extensions => {
      this.extensions = extensions;
    });
  }

  refreshCodes() {
    this.dataService.getPlainCodes(this.codeScheme.codeRegistry.codeValue, this.codeScheme.codeValue).subscribe(codes => {
      this.codes = codes;
    });
  }

  refreshExtensions() {
    this.dataService.getExtensions(this.codeScheme.codeRegistry.codeValue, this.codeScheme.codeValue).subscribe(extensions => {
      this.extensions = extensions;
    });
  }

  get loading(): boolean {
    return this.codeScheme == null ||
      this.codes == null ||
      this.extensions == null ||
      this.env == null ||
      this.deleting;
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

  back() {
    this.router.navigate(['frontpage']);
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

    Object.assign(updatedCodeScheme, {
      ...rest,
      startDate: validity.start,
      endDate: validity.end
    });

    const save = () => {
      console.log('Store CodeScheme changes to server!');
      return this.dataService.saveCodeScheme(updatedCodeScheme.serialize()).pipe(tap(() => this.ngOnInit()));
    };

    if (changeToRestrictedStatus(this.codeScheme, formData.status)) {
      return from(this.confirmationModalService.openChangeToRestrictedStatus()).pipe(flatMap(save));
    } else {
      return save();
    }
  }

  navigateToRoute(route: any[]) {
    this.router.navigate(route);
  }

  importExtensions() {

    this.extensionsImportModalService.open(this.codeScheme).then(success => {
      if (success) {
        this.refreshExtensions();
      }
    }, ignoreModalClose);
  }

  createExtension(propertyTypeLocalName: string) {

    console.log('Create extension clicked with type: ' + propertyTypeLocalName);
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
        this.refreshCodes();
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

  get showMenu(): boolean {

    return this.canDeleteCodeScheme ||
      this.canAddExtension ||
      this.canCreateANewVersionFromCodeScheme ||
      this.canAttachOrDetachAVariant ||
      this.canAddCode;
  }

  get canDeleteCodeScheme(): boolean {
    return this.authorizationManager.canDeleteCodeScheme(this.codeScheme);
  }

  get canAddExtension(): boolean {
    return this.showUnfinishedFeature && this.authorizationManager.canEdit(this.codeScheme);
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

  createANewVersionFromThisCodeScheme() {
    console.log('Copy codescheme clicked!');
    this.router.navigate(['createcodescheme'], { queryParams: { 'originalCodeSchemeId': this.codeScheme.id } });
  }

  get showUnfinishedFeature() {
    return this.env === 'dev' || this.env === 'local';
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
              id: this.chosenVariant.id, prefLabel: this.chosenVariant.prefLabel,
              uri: this.chosenVariant.uri, startDate: theStart,
              endDate: theEnd, status: this.chosenVariant.status
            })
          );
        }
      });
  }

  changeLanguages(codes: CodePlain[]) {
    this.languageCodes = codes;
  }
}
