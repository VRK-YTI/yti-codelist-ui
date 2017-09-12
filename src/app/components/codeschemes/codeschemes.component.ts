import { Component, OnInit } from '@angular/core';
import { CodeScheme } from '../../model/codescheme';
import { DataService } from '../../services/data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CodeRegistry } from '../../model/coderegistry';

@Component({
  selector: 'app-codeschemes',
  templateUrl: './codeschemes.component.html',
  styleUrls: ['./codeschemes.component.css']
})
export class CodeSchemesComponent implements OnInit {

  codeRegistry: CodeRegistry;
  codeSchemes: CodeScheme[];
  codeRegistryCodeValue: string;

  constructor(private dataService: DataService,
              private router: Router,
              private route: ActivatedRoute) { }

  ngOnInit() {
    if (this.route != null) {
      this.codeRegistryCodeValue = this.route.snapshot.params['codeRegistryCodeValue'];
      if (this.codeRegistryCodeValue != null) {
        this.dataService.getCodeRegistry(this.codeRegistryCodeValue).subscribe((codeRegistry) => {
          this.codeRegistry = codeRegistry;
        });
        this.dataService.getCodeSchemes(this.codeRegistryCodeValue).subscribe((codeSchemes) => {
          this.codeSchemes = codeSchemes['results'];
        });
      }
    }
  }

  showCodes(codeScheme) {
    console.log('Showing codes for coderegistry: ' + this.codeRegistryCodeValue + ', codescheme: ' + codeScheme.codeValue);
    this.router.navigate(['/codes',
      { codeRegistryCodeValue: this.codeRegistryCodeValue, codeSchemeCodeValue: codeScheme.codeValue }]);
  }

  viewCodeScheme(codeScheme) {
    console.log('Viewing codescheme: ' + codeScheme.codeValue + ' from coderegistry: ' + this.codeRegistryCodeValue);
    this.router.navigate(['/codescheme',
      { codeRegistryCodeValue: this.codeRegistryCodeValue, codeSchemeCodeValue: codeScheme.codeValue }]);
  }

  createCodeScheme() {
    console.log('Create new code scheme!');
    this.router.navigate(['/codescheme', { codeRegistryCodeValue: this.codeRegistryCodeValue }]);
  }

  back() {
    this.router.navigate(['coderegistries']);
  }

}
