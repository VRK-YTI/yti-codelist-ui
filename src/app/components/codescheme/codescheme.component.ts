import { Component, OnInit } from '@angular/core';
import { CodeScheme } from '../../model/codescheme';
import { DataService } from '../../services/data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Code } from '../../model/code';
import { LocationService } from '../../services/location.service';

@Component({
  selector: 'app-codescheme',
  templateUrl: './codescheme.component.html',
  styleUrls: ['./codescheme.component.scss']
})
export class CodeSchemeComponent implements OnInit {

  codeScheme: CodeScheme;
  codes: Code[];
  codeRegistryCodeValue: string;
  codeSchemeCodeValue: string;

  constructor(private dataService: DataService,
              private route: ActivatedRoute,
              private router: Router,
              private locationService: LocationService) {
  }

  ngOnInit() {
    if (this.route != null) {
      this.codeRegistryCodeValue = this.route.snapshot.params.codeRegistryCodeValue;
      this.codeSchemeCodeValue = this.route.snapshot.params.codeSchemeCodeValue;
      if (this.codeRegistryCodeValue != null && this.codeSchemeCodeValue != null) {
        this.dataService.getCodeScheme(this.codeRegistryCodeValue, this.codeSchemeCodeValue).subscribe(codeScheme => {
          this.codeScheme = codeScheme;
          this.locationService.atCodeSchemePage(codeScheme);
        });
        this.dataService.getCodes(this.codeRegistryCodeValue, this.codeSchemeCodeValue).subscribe(codes => {
          this.codes = codes;
        });
      }
    }
  }

  viewCode(code: Code) {
    console.log('View code: ' + code.codeValue);
    this.router.navigate(['code',
      { codeRegistryCodeValue: code.codeScheme.codeRegistry.codeValue, codeSchemeCodeValue: code.codeScheme.codeValue, codeCodeValue: code.codeValue }]);
  }

  back() {
    this.router.navigate(['frontpage', { }]);
  }
}
