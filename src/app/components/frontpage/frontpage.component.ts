import { Component, OnInit } from '@angular/core';
import { LocationService } from '../../services/location.service';
import { DataService } from '../../services/data.service';
import { Router } from '@angular/router';
import { CodeScheme } from '../../entities/code-scheme';
import { CodeRegistry } from '../../entities/code-registry';
import { DataClassification } from '../../entities/data-classification';
import { CodeRegistryType } from '../../services/api-schema';
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
  
  dataClassifications: DataClassification[];
  register$ = new BehaviorSubject('');

  searchTerm$ = new BehaviorSubject('');
  classification$ = new BehaviorSubject<DataClassification|null>(null);
  status$ = new BehaviorSubject<Status|null>(null);

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

    const initialSearchTerm = this.searchTerm$.take(1);
    const debouncedSearchTerm = this.searchTerm$.skip(1).debounceTime(500);
    const searchTerm$ = initialSearchTerm.concat(debouncedSearchTerm); 

    Observable.combineLatest(searchTerm$, this.classification$, this.status$, this.register$)
              .subscribe(([searchTerm, classification, status, register]) => {

      this.searchInProgress = true;
      const classificationCode = classification ? classification.codeValue : null;
      const statusMatches = (codeScheme: CodeScheme) => !status || codeScheme.status === status;
      const registerMatches = (codeScheme: CodeScheme) => !register || codeScheme.codeRegistry.codeValue === register;
       
       this.dataService.searchCodeSchemes(searchTerm, classificationCode).subscribe(codeSchemes => {
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

  get register(): string {
    return this.register$.getValue();
  }

  set register(value: string) {
    this.register$.next(value);
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
