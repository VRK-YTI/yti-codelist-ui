import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import { Code } from '../../model/code';
import { ActivatedRoute, Router } from '@angular/router';
import { LocationService } from '../../services/location.service';

@Component({
  selector: 'app-code',
  templateUrl: './code.component.html',
  styleUrls: ['./code.component.scss']
})
export class CodeComponent implements OnInit {

  code: Code;
  codeRegistryCodeValue: string;
  codeSchemeCodeValue: string;
  codeCodeValue: string;

  constructor(private dataService: DataService,
              private route: ActivatedRoute,
              private router: Router,
              private locationService: LocationService) {
  }

  ngOnInit() {
    if (this.route != null) {
      this.codeCodeValue = this.route.snapshot.params.codeCodeValue;
      this.codeRegistryCodeValue = this.route.snapshot.params.codeRegistryCodeValue;
      this.codeSchemeCodeValue = this.route.snapshot.params.codeSchemeCodeValue;
      this.dataService.getCode(this.codeRegistryCodeValue, this.codeSchemeCodeValue, this.codeCodeValue).subscribe(code => {
        this.code = code;
        this.locationService.atCodePage(code);
      });
    }
  }

  back() {
    this.router.navigate(['codescheme',
      { codeRegistryCodeValue: this.codeRegistryCodeValue, codeSchemeCodeValue: this.codeSchemeCodeValue }]);
  }
}
