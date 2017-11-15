import { Component, OnInit } from '@angular/core';
import { LocationService } from '../../services/location.service';
import { DataService } from '../../services/data.service';
import { Router } from '@angular/router';
import { CodeScheme } from '../../entities/code-scheme';
import { Observable } from 'rxjs/Observable';
import { DataClassification } from '../../entities/data-classification';
import { statuses } from '../../entities/status';

@Component({
  selector: 'app-frontpage',
  templateUrl: './frontpage.component.html',
  styleUrls: ['./frontpage.component.scss'],
})
export class FrontpageComponent implements OnInit {
  codeSchemes: Observable<CodeScheme[]>;
  filteredCodeSchemes: Observable<CodeScheme[]>;
  dataClassifications: DataClassification[];
  status: string;
  statuses = statuses;

  constructor(private dataService: DataService,
              private router: Router,
              locationService: LocationService) {
    locationService.atFrontPage();
  }

  ngOnInit() {
    this.codeSchemes = this.dataService.getCodeSchemes();
    this.filteredCodeSchemes = this.codeSchemes;
    this.dataService.getDataClassifications().subscribe(classifications => {
      this.dataClassifications = classifications.filter(c => c.count > 0);
    });
    this.status = 'ALL';
  }

  get loading(): boolean {
    return this.dataClassifications == null;
  }

  selectDataClassification(dataClassification: string) {
    this.codeSchemes = this.dataService.getCodeSchemesWithClassification(dataClassification);
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
    this.filterWithStatus(this.status);
  }

  viewCodeScheme(codeScheme: CodeScheme) {
    console.log('Viewing codescheme: ' + codeScheme.codeValue + ' from coderegistry: ' + codeScheme.codeRegistry.codeValue);
    this.router.navigate(codeScheme.route);
  }

  viewOrganization() {
    console.log('Organization viewing not implemented yet.');
  }
}
