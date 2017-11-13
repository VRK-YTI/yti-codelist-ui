import { Component, OnInit } from '@angular/core';
import { LocationService } from '../../services/location.service';
import { DataService } from '../../services/data.service';
import { Router } from '@angular/router';
import { CodeScheme } from '../../model/codescheme';
import { Observable } from 'rxjs/Observable';
import { ServiceClassification } from '../../model/serviceclassification';

@Component({
  selector: 'app-frontpage',
  templateUrl: './frontpage.component.html',
  styleUrls: ['./frontpage.component.scss'],
})
export class FrontpageComponent implements OnInit {
  codeSchemes: Observable<CodeScheme[]>;
  filteredCodeSchemes: Observable<CodeScheme[]>;
  serviceClassifications: ServiceClassification[];
  status: string;

  constructor(private dataService: DataService,
              private router: Router,
              locationService: LocationService) {
    locationService.atFrontPage();
  }

  ngOnInit() {
    this.codeSchemes = this.dataService.getCodeSchemes();
    this.filteredCodeSchemes = this.codeSchemes;
    this.dataService.getServiceClassifications().subscribe(classifications => {
      this.serviceClassifications = classifications.filter(c => c.count > 0);
    });
    this.status = 'ALL';
  }

  get loading(): boolean {
    return this.serviceClassifications == null;
  }

  selectServiceClassification(serviceClassification: string) {
    this.codeSchemes = this.dataService.getCodeSchemesWithClassification(serviceClassification);
    this.filterWithStatus(this.status);
  }

  filterWithStatus(status: string) {
    this.status = status;
    if (status !== 'ALL') {
      this.filteredCodeSchemes = this.codeSchemes.map(codeSchemes => codeSchemes.filter(codeScheme => codeScheme.status === status));
    } else {
      this.filteredCodeSchemes = this.codeSchemes;
    }
  }

  searchCodeSchemes(term: string): void {
    if (term.length === 0) {
      this.codeSchemes = this.dataService.getCodeSchemes();
    } else {
      this.codeSchemes = this.dataService.getCodeSchemesWithTerm(term);
    }
  }

  viewCodeScheme(codeScheme: CodeScheme) {
    console.log('Viewing codescheme: ' + codeScheme.codeValue + ' from coderegistry: ' + codeScheme.codeRegistry.codeValue);
    this.router.navigate(['/codescheme',
      {codeRegistryCodeValue: codeScheme.codeRegistry.codeValue, codeSchemeCodeValue: codeScheme.codeValue}]);
  }

  viewOrganization() {
    console.log('Organization viewing not implemented yet.');
  }
}
