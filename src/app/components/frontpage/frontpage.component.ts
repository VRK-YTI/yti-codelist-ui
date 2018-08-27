import { Component, OnInit, OnDestroy } from '@angular/core';
import { LocationService } from '../../services/location.service';
import { DataService } from '../../services/data.service';
import { Router } from '@angular/router';
import { CodeScheme } from '../../entities/code-scheme';
import { CodeRegistry } from '../../entities/code-registry';
import { DataClassification } from '../../entities/data-classification';
import { Organization } from '../../entities/organization';
import { Status, allStatuses } from 'yti-common-ui/entities/status';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { FilterOptions } from 'yti-common-ui/components/filter-dropdown.component';
import { LanguageService } from '../../services/language.service';
import { TranslateService } from 'ng2-translate';
import { comparingLocalizable } from 'yti-common-ui/utils/comparator';
import { anyMatching } from 'yti-common-ui/utils/array';
import { Option } from 'yti-common-ui/components/dropdown.component';
import { Subscription } from 'rxjs';
import { AuthorizationManager } from '../../services/authorization-manager.service';
import { ServiceConfiguration } from '../../entities/service-configuration';
import { labelNameToResourceIdIdentifier } from 'yti-common-ui/utils/resource';

@Component({
  selector: 'app-frontpage',
  templateUrl: './frontpage.component.html',
  styleUrls: ['./frontpage.component.scss'],
})
export class FrontpageComponent implements OnInit, OnDestroy {

  codeRegistries: CodeRegistry[];

  statusOptions: FilterOptions<Status>;
  registryOptions: FilterOptions<CodeRegistry>;
  organizationOptions: FilterOptions<Organization>;

  dataClassifications: { entity: DataClassification, count: number }[];
  registry$ = new BehaviorSubject<CodeRegistry|null>(null);

  searchTerm$ = new BehaviorSubject('');
  classification$ = new BehaviorSubject<DataClassification|null>(null);
  status$ = new BehaviorSubject<Status|null>(null);
  organization$ = new BehaviorSubject<Organization|null>(null);

  filteredCodeSchemes: CodeScheme[];

  searchInProgress = true;
  searchCodesValue = false;
  searchCodes$ = new BehaviorSubject(this.searchCodesValue);

  configuration: ServiceConfiguration;

  private subscriptionToClean: Subscription[] = [];

  constructor(private dataService: DataService,
              private router: Router,
              public languageService: LanguageService,
              private translateService: TranslateService,
              private authorizationManager: AuthorizationManager,
              locationService: LocationService) {

    locationService.atFrontPage();
  }

  ngOnInit() {
    this.dataService.getServiceConfiguration().subscribe(configuration => {
      this.configuration = configuration;
      if (configuration.defaultStatus) {
        this.status$.next(configuration.defaultStatus as Status);
      }
      this.initialize();
    });
  }

  initialize() {
    this.dataService.getCodeRegistriesForUser().subscribe(codeRegistries => {
      this.codeRegistries = codeRegistries;
    });

    this.dataService.getCodeRegistries().subscribe(registries => {
      this.registryOptions = [null, ...registries].map(registry => ({
        value: registry,
        name: () => registry ? this.languageService.translate(registry.prefLabel, true)
          : this.translateService.instant('All registries'),
        idIdentifier: () => registry ? registry.codeValue : 'all_selected'
      }));
    });

    this.subscriptionToClean.push(Observable.combineLatest(this.dataService.getOrganizations(), this.languageService.language$)
      .subscribe(([organizations]) => {
        this.organizationOptions = [null, ...organizations].map(organization => ({
          value: organization,
          name: () => organization ? this.languageService.translate(organization.prefLabel, true)
            : this.translateService.instant('All organizations'),
          idIdentifier: () => organization ? labelNameToResourceIdIdentifier(this.languageService.translate(organization.prefLabel, true))
            : 'all_selected'
        }));
        this.organizationOptions.sort(comparingLocalizable<Option<Organization>>(this.languageService, c =>
          c.value ? c.value.prefLabel : {}));
      }));

    this.statusOptions = [null, ...allStatuses].map(status => ({
      value: status,
      name: () => this.translateService.instant(status ? status : 'All statuses'),
      idIdentifier: () => status ? status : 'all_selected'
    }));

    const initialSearchTerm = this.searchTerm$.take(1);
    const debouncedSearchTerm = this.searchTerm$.skip(1).debounceTime(500);
    const searchTerm$ = initialSearchTerm.concat(debouncedSearchTerm);

    const dataClassifications$ = this.dataService.getDataClassifications(this.languageService.language);

    function statusMatches(status: Status|null, codeScheme: CodeScheme) {
      return !status || codeScheme.status === status;
    }

    function registryMatches(registry: CodeRegistry|null, codeScheme: CodeScheme) {
      return !registry || codeScheme.codeRegistry.codeValue === registry.codeValue;
    }

    function calculateCount(classification: DataClassification, codeSchemes: CodeScheme[]) {
      return codeSchemes.filter(cs =>
        anyMatching(cs.dataClassifications, rc => rc.id === classification.id)).length;
    }

    Observable.combineLatest(searchTerm$, this.classification$, this.status$, this.registry$, this.organization$,
      this.searchCodes$, this.languageService.language$)
      .do(() => this.searchInProgress = true)
      .flatMap(([searchTerm, classification, status, registry, organization, searchCodes, language]) => {
        const classificationCode = classification ? classification.codeValue : null;
        const organizationId = organization ? organization.id : null;
        const sortMode = this.configuration.codeSchemeSortMode ? this.configuration.codeSchemeSortMode : null;

        return this.dataService.searchCodeSchemes(searchTerm, classificationCode, organizationId, sortMode, searchCodes, language)
          .map(codeSchemes => codeSchemes.filter(codeScheme =>
            statusMatches(status, codeScheme) &&
            registryMatches(registry, codeScheme))
          );
      })
      .do(() => this.searchInProgress = false)
      .subscribe(results => this.filteredCodeSchemes = results);

    Observable.combineLatest(dataClassifications$, searchTerm$, this.status$, this.registry$, this.organization$,
      this.searchCodes$, this.languageService.language$)
      .subscribe(([classifications, searchTerm, status, registry, organization, searchCodes, language]) => {
        classifications.sort(comparingLocalizable<DataClassification>(this.languageService, classification => classification.prefLabel));
        const organizationId = organization ? organization.id : null;
        const sortMode = this.configuration.codeSchemeSortMode ? this.configuration.codeSchemeSortMode : null;

        this.dataService.searchCodeSchemes(searchTerm, null, organizationId, sortMode, searchCodes, language)
          .map(codeSchemes => codeSchemes.filter(codeScheme =>
            statusMatches(status, codeScheme) &&
            registryMatches(registry, codeScheme))
          )
          .subscribe(codeSchemes => {
            this.dataClassifications = classifications.map((classification: DataClassification) => ({
              entity: classification,
              count: calculateCount(classification, codeSchemes)
            }));
          });
      });
  }

  isClassificationSelected(classification: DataClassification) {
    return this.classification$.getValue() === classification;
  }

  toggleClassification(classification: DataClassification) {
    this.classification$.next(this.isClassificationSelected(classification) ? null : classification);
  }

  toggleSearchCodes() {
    this.searchCodesValue = !this.searchCodesValue;
    this.searchCodes$.next(this.searchCodesValue);
  }

  get searchTerm(): string {
    return this.searchTerm$.getValue();
  }

  set searchTerm(value: string) {
    this.searchTerm$.next(value);
  }

  get loading(): boolean {
    return this.dataClassifications == null || this.filteredCodeSchemes == null;
  }

  importCodeScheme() {
    this.router.navigate(['importandcreatecodescheme']);
  }

  viewCodeScheme(codeScheme: CodeScheme) {
    console.log('Viewing codescheme: ' + codeScheme.codeValue + ' from registry: ' + codeScheme.codeRegistry.codeValue);
    this.router.navigate(codeScheme.route);
  }

  ngOnDestroy(): void {
    this.subscriptionToClean.forEach(s => s.unsubscribe());
  }

  canCreateCodeScheme() {
    return this.authorizationManager.canCreateACodeSchemeOrAVersionAndAttachAVariant(this.codeRegistries);
  }
}
