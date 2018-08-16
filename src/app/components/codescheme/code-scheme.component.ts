import { Component, OnInit, ViewChild } from '@angular/core';
import { CodeScheme } from '../../entities/code-scheme';
import { DataService } from '../../services/data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LocationService } from '../../services/location.service';
import { EditableService, EditingComponent } from '../../services/editable.service';
import { NgbTabChangeEvent, NgbTabset } from '@ng-bootstrap/ng-bootstrap';
import { ignoreModalClose } from 'yti-common-ui//utils/modal';
import { Observable } from 'rxjs/Observable';
import { LanguageService } from '../../services/language.service';
import { CodePlain } from '../../entities/code-simple';
import { UserService } from 'yti-common-ui/services/user.service';
import { CodeListConfirmationModalService } from '../common/confirmation-modal.service';
import { CodeListErrorModalService } from '../common/error-modal.service';
import { AuthorizationManager } from '../../services/authorization-manager.service';
import { ExtensionScheme } from '../../entities/extension-scheme';
import { ExtensionSchemesImportModalService } from '../extensionscheme/extension-scheme-import-modal.component';
import { CodeRegistry } from '../../entities/code-registry';
import {CodeSchemeListItem} from '../../entities/code-scheme-list-item';
import {comparingLocalizable} from 'yti-common-ui/utils/comparator';
import {CodeschemeVariantModalService} from '../codeschemevariant/codescheme-variant.modal.component';

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
  extensionSchemes: ExtensionScheme[];
  codeRegistries: CodeRegistry[];
  env: string;
  chosenVariant: CodeScheme;

  constructor(private userService: UserService,
              private dataService: DataService,
              private route: ActivatedRoute,
              private router: Router,
              private locationService: LocationService,
              public languageService: LanguageService,
              private editableService: EditableService,
              private confirmationModalService: CodeListConfirmationModalService,
              private extensionSchemesImportModalService: ExtensionSchemesImportModalService,
              private errorModalService: CodeListErrorModalService,
              private authorizationManager: AuthorizationManager,
              private codeschemeVariantModalService: CodeschemeVariantModalService) {

    editableService.onSave = (formValue: any) => this.save(formValue);
  }

  ngOnInit() {

    const registryCodeValue = this.route.snapshot.params.registryCode;
    const schemeCodeValue = this.route.snapshot.params.schemeCode;

    if (!registryCodeValue || !schemeCodeValue) {
      throw new Error(`Illegal route, registry: '${registryCodeValue}', scheme: '${schemeCodeValue}'`);
    }

    this.dataService.getCodeRegistriesForUser().subscribe(codeRegistries => {
      this.codeRegistries = codeRegistries;
    });

    this.dataService.getServiceConfiguration().subscribe(configuration => {
      this.env = configuration.env;
    });

    this.dataService.getCodeScheme(registryCodeValue, schemeCodeValue).subscribe(codeScheme => {
      this.codeScheme = codeScheme;
      this.codeScheme.variantsOfThisCodeScheme.sort( comparingLocalizable<CodeSchemeListItem>(this.languageService, item =>
        item.prefLabel ? item.prefLabel : {}));
      this.locationService.atCodeSchemePage(codeScheme);
    });

    this.dataService.getPlainCodes(registryCodeValue, schemeCodeValue).subscribe(codes => {
      this.codes = codes;
    });

    this.dataService.getExtensionSchemes(registryCodeValue, schemeCodeValue).subscribe(extensionSchemes => {
      this.extensionSchemes = extensionSchemes;
    });
  }

  refreshCodes() {
    this.dataService.getPlainCodes(this.codeScheme.codeRegistry.codeValue, this.codeScheme.codeValue).subscribe(codes => {
      this.codes = codes;
    });
  }

  refreshExtensionSchemes() {
    this.dataService.getExtensionSchemes(this.codeScheme.codeRegistry.codeValue, this.codeScheme.codeValue).subscribe(extensionSchemes => {
      this.extensionSchemes = extensionSchemes;
    });
  }

  get loading(): boolean {
    return this.codeScheme == null ||
      this.codes == null ||
      this.extensionSchemes == null ||
      this.codeRegistries == null ||
      this.env == null;
  }

  onTabChange(event: NgbTabChangeEvent) {

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

  get canDelete() {
    return this.userService.user.superuser || (this.authorizationManager.canDelete(this.codeScheme) &&
      (this.codeScheme.status === 'INCOMPLETE' ||
        this.codeScheme.status === 'DRAFT' ||
        this.codeScheme.status === 'SUGGESTED' ||
        this.codeScheme.status === 'SUBMITTED'));
  }

  get canAddExtensionScheme(): boolean {
    return this.authorizationManager.canEdit(this.codeScheme);
  }

  get canCreateANewVersionFromCodeScheme(): boolean {
    return this.authorizationManager.canCreateACodeSchemeOrAVersionAndAttachAVariant(this.codeRegistries);
  }

  get isSuperUser(): boolean {
    return this.userService.user.superuser;
  }

  delete() {
    this.confirmationModalService.openRemoveCodeScheme()
      .then(() => {
        this.dataService.deleteCodeScheme(this.codeScheme).subscribe(res => {
          this.router.navigate(['frontpage']);
        }, error => {
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

    console.log('Store CodeScheme changes to server!');

    const {validity, ...rest} = formData;
    const updatedCodeScheme = this.codeScheme.clone();

    Object.assign(updatedCodeScheme, {
      ...rest,
      startDate: validity.start,
      endDate: validity.end
    });
    return this.dataService.saveCodeScheme(updatedCodeScheme.serialize()).do(() => this.ngOnInit());
  }

  navigateToRoute(route: any[]) {
    this.router.navigate(route);
  }

  importExtensionSchemes() {
    this.extensionSchemesImportModalService.open(this.codeScheme).then(success => {
      if (success) {
        this.refreshExtensionSchemes();
      }
    }, ignoreModalClose);
  }

  createExtensionScheme() {
    console.log('Create extensionScheme clicked!');
    this.router.navigate(
      ['createextensionscheme',
        {
          registryCode: this.codeScheme.codeRegistry.codeValue,
          schemeCode: this.codeScheme.codeValue
        }
      ]
    );
  }

  createANewVersionFromThisCodeScheme() {
    console.log('Copy codescheme clicked!');
    this.router.navigate(['createcodescheme'], {queryParams: {'originalCodeSchemeId': this.codeScheme.id}});
  }

  get showUnfinishedFeature() {
    return this.env === 'dev';
  }

  reloadCodeScheme() {

    const registryCodeValue = this.route.snapshot.params.registryCode;
    const schemeCodeValue = this.route.snapshot.params.schemeCode;

    this.dataService.getCodeScheme(registryCodeValue, schemeCodeValue).subscribe(codeScheme => {
      this.codeScheme = codeScheme;
      this.codeScheme.variantsOfThisCodeScheme.sort( comparingLocalizable<CodeSchemeListItem>(this.languageService, item =>
        item.prefLabel ? item.prefLabel : {}));
      this.locationService.atCodeSchemePage(codeScheme);
    });
  }

  canAttachOrDetachAVariant(): boolean {
    return this.authorizationManager.canCreateACodeSchemeOrAVersionAndAttachAVariant(this.codeRegistries);
  }

  openVariantSearchModal() {
    this.codeschemeVariantModalService.open()
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
            new CodeSchemeListItem( { id: this.chosenVariant.id, prefLabel: this.chosenVariant.prefLabel,
              uri: this.chosenVariant.uri, startDate: theStart,
              endDate: theEnd, status: this.chosenVariant.status} )
          );
        }
      });
  }
}
