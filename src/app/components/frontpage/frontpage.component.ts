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
import { UserService } from 'yti-common-ui/services/user.service';
import { FilterOptions } from 'yti-common-ui/components/filter-dropdown.component';
import { LanguageService } from '../../services/language.service';
import { TranslateService } from 'ng2-translate';
import { comparingLocalizable } from 'yti-common-ui/utils/comparator';
import { anyMatching } from 'yti-common-ui/utils/array';
import { Option } from 'yti-common-ui/components/dropdown.component';
import { Subscription } from 'rxjs';
import { AuthorizationManager } from '../../services/authorization-manager.service';


@Component({
  selector: 'app-frontpage',
  templateUrl: './frontpage.component.html',
  styleUrls: ['./frontpage.component.scss'],
})
export class FrontpageComponent implements OnInit, OnDestroy {


  codeRegistries: CodeRegistry[];

  statusOptions: FilterOptions<Status>;
  registerOptions: FilterOptions<CodeRegistry>;
  organizationOptions: FilterOptions<Organization>;

  dataClassifications: { entity: DataClassification, count: number }[];
  register$ = new BehaviorSubject<CodeRegistry|null>(null);

  searchTerm$ = new BehaviorSubject('');
  classification$ = new BehaviorSubject<DataClassification|null>(null);
  status$ = new BehaviorSubject<Status|null>('VALID');
  organization$ = new BehaviorSubject<Organization|null>(null);

  filteredCodeSchemes: CodeScheme[];

  searchInProgress = true;

  private subscriptionToClean: Subscription[] = [];

  constructor(private dataService: DataService,
              private router: Router,
              private userService: UserService,
              public languageService: LanguageService,
              private translateService: TranslateService,
              private authorizationManager: AuthorizationManager,
              locationService: LocationService) {

    locationService.atFrontPage();
  }

  ngOnInit() {
    this.dataService.getCodeRegistriesForUser().subscribe(codeRegistries => {
      this.codeRegistries = codeRegistries;
    });


    this.dataService.getCodeRegistries().subscribe(registers => {
      this.registerOptions = [null, ...registers].map(register => ({
        value: register,
        name: () => register ? this.languageService.translate(register.prefLabel, true)
                             : this.translateService.instant('All registries')
      }));
    });

    this.subscriptionToClean.push(Observable.combineLatest(this.dataService.getOrganizations(), this.languageService.language$)
      .subscribe(([organizations]) => {
        this.organizationOptions = [null, ...organizations].map(organization => ({
          value: organization,
          name: () => organization ? this.languageService.translate(organization.prefLabel, true)
                                   : this.translateService.instant('All organizations')
        }));
        this.organizationOptions.sort(comparingLocalizable<Option<Organization>>(this.languageService, c =>
          c.value ? c.value.prefLabel : {}));
      }));

    this.statusOptions = [null, ...allStatuses].map(status => ({
      value: status,
      name: () => this.translateService.instant(status ? status : 'All statuses')
    }));

    const initialSearchTerm = this.searchTerm$.take(1);
    const debouncedSearchTerm = this.searchTerm$.skip(1).debounceTime(500);
    const searchTerm$ = initialSearchTerm.concat(debouncedSearchTerm);

    const dataClassifications$ = this.dataService.getDataClassifications();

    function statusMatches(status: Status|null, codeScheme: CodeScheme) {
      return !status || codeScheme.status === status;
    }

    function registerMatches(register: CodeRegistry|null, codeScheme: CodeScheme) {
      return !register || codeScheme.codeRegistry.codeValue === register.codeValue;
    }

    function calculateCount(classification: DataClassification, codeSchemes: CodeScheme[]) {
      return codeSchemes.filter(cs =>
        anyMatching(cs.dataClassifications, rc => rc.id === classification.id)).length;
    }

    Observable.combineLatest(searchTerm$, this.classification$, this.status$, this.register$, this.organization$)
      .do(() => this.searchInProgress = true)
      .flatMap(([searchTerm, classification, status, register, organization]) => {

        const classificationCode = classification ? classification.codeValue : null;
        const organizationId = organization ? organization.id : null;

        return this.dataService.searchCodeSchemes(searchTerm, classificationCode, organizationId)
          .map(codeSchemes => codeSchemes.filter(codeScheme =>
            statusMatches(status, codeScheme) &&
            registerMatches(register, codeScheme))
          );
      })
      .do(() => this.searchInProgress = false)
      .subscribe(results => this.filteredCodeSchemes = results);

    Observable.combineLatest(dataClassifications$, searchTerm$, this.status$, this.register$, this.organization$)
      .subscribe(([classifications, searchTerm, status, register, organization]) => {

        const organizationId = organization ? organization.id : null;

        this.dataService.searchCodeSchemes(searchTerm, null, organizationId)
          .map(codeSchemes => codeSchemes.filter(codeScheme =>
            statusMatches(status, codeScheme) &&
            registerMatches(register, codeScheme))
          )
          .subscribe(codeSchemes => {
            this.dataClassifications = classifications.map(classification => ({
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
    console.log('Viewing codescheme: ' + codeScheme.codeValue + ' from coderegistry: ' + codeScheme.codeRegistry.codeValue);
    this.router.navigate(codeScheme.route);
  }

  ngOnDestroy(): void {
    this.subscriptionToClean.forEach(s => s.unsubscribe());
  }

  canCreateCodeScheme() {
    return this.authorizationManager.canCreateCodeScheme(this.codeRegistries);
  }
}
