import { Component, OnInit } from '@angular/core';
import { LocationService } from '../../services/location.service';
import { DataService } from '../../services/data.service';
import { Router } from '@angular/router';
import { CodeScheme } from '../../entities/code-scheme';
import { CodeRegistry } from '../../entities/code-registry';
import { DataClassification } from '../../entities/data-classification';
import { Organization } from '../../entities/organization';
import { Status, statuses } from '../../entities/status';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-frontpage',
  templateUrl: './frontpage.component.html',
  styleUrls: ['./frontpage.component.scss'],
})
export class FrontpageComponent implements OnInit {

  statuses = statuses;
  registers: CodeRegistry[];
  organizations: Organization[];

  dataClassifications: DataClassification[];
  register$ = new BehaviorSubject<CodeRegistry|null>(null);

  searchTerm$ = new BehaviorSubject('');
  classification$ = new BehaviorSubject<DataClassification|null>(null);
  status$ = new BehaviorSubject<Status|null>(null);
  organization$ = new BehaviorSubject<Organization|null>(null);

  filteredCodeSchemes: CodeScheme[];

  searchInProgress = true;

  constructor(private dataService: DataService,
              private router: Router,
              locationService: LocationService) {
    locationService.atFrontPage();
  }

  ngOnInit() {

    this.dataService.getDataClassifications().subscribe(classifications => {
      this.dataClassifications = classifications.filter(c => c.count > 0);
    });

    this.dataService.getCodeRegistries().subscribe(registers => {
      this.registers = registers;
    });

    this.dataService.getOrganizations().subscribe(organizations => {
      this.organizations = organizations;
    });

    const initialSearchTerm = this.searchTerm$.take(1);
    const debouncedSearchTerm = this.searchTerm$.skip(1).debounceTime(500);
    const searchTerm$ = initialSearchTerm.concat(debouncedSearchTerm);

    Observable.combineLatest(searchTerm$, this.classification$, this.status$, this.register$, this.organization$)
              .subscribe(([searchTerm, classification, status, register, organization]) => {

      this.searchInProgress = true;
      const classificationCode = classification ? classification.codeValue : null;
      const organizationId = organization ? organization.id : null;
      const statusMatches = (codeScheme: CodeScheme) => !status || codeScheme.status === status;
      const registerMatches = (codeScheme: CodeScheme) => !register || codeScheme.codeRegistry.codeValue === register.codeValue;

      this.dataService.searchCodeSchemes(searchTerm, classificationCode, organizationId).subscribe(codeSchemes => {
           this.filteredCodeSchemes = codeSchemes.filter(statusMatches).filter(registerMatches);
           this.searchInProgress = false;     
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

  get status(): Status|null {
    return this.status$.getValue();
  }

  set status(value: Status|null) {
    this.status$.next(value);
  }

  get register(): CodeRegistry|null {
    return this.register$.getValue();
  }

  set register(value: CodeRegistry|null) {
    this.register$.next(value);
  }

  get organization(): Organization|null {
    return this.organization$.getValue();
  }

  set organization(value: Organization|null) {
    this.organization$.next(value);
  }

  get loading(): boolean {
    return this.dataClassifications == null || this.filteredCodeSchemes == null;
  }

  viewCodeScheme(codeScheme: CodeScheme) {
    console.log('Viewing codescheme: ' + codeScheme.codeValue + ' from coderegistry: ' + codeScheme.codeRegistry.codeValue);
    this.router.navigate(codeScheme.route);
  }

  viewOrganization() {
    console.log('Organization viewing not implemented yet.');
  }
}
