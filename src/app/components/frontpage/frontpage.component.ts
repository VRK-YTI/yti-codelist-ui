import { Component, OnInit } from '@angular/core';
import { LocationService } from '../../services/location.service';
import { DataService } from '../../services/data.service';
import { Router } from '@angular/router';
import { CodeScheme } from '../../model/codescheme';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-frontpage',
  templateUrl: './frontpage.component.html',
  styleUrls: ['./frontpage.component.scss'],
})
export class FrontpageComponent implements OnInit {
  codeSchemes: Observable<CodeScheme[]>;

  constructor(private dataService: DataService,
              private router: Router,
              locationService: LocationService) {
    locationService.atFrontPage();
  }

  ngOnInit() {
    this.codeSchemes = this.dataService.getCodeSchemes();
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
      { codeRegistryCodeValue: codeScheme.codeRegistry.codeValue, codeSchemeCodeValue: codeScheme.codeValue }]);
  }

  viewOrganization() {
    console.log('Organization viewing not implemented yet.');
  }
}
