import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import { Code } from '../../model/code';
import { ActivatedRoute, Router } from '@angular/router';
import { CodeScheme } from '../../model/codescheme';
import { CodeRegistry } from '../../model/coderegistry';

@Component({
  selector: 'app-codes',
  templateUrl: './codes.component.html',
  styleUrls: ['./codes.component.css']
})
export class CodesComponent implements OnInit {

  codeRegistry: CodeRegistry;
  codeScheme: CodeScheme;
  codes: Code[];
  codeSchemeCodeValue: string;
  codeRegistryCodeValue: string;

  constructor(private dataService: DataService,
              private route: ActivatedRoute,
              private router: Router) {
  }

  ngOnInit() {
    if (this.route != null) {
      this.codeRegistryCodeValue = this.route.snapshot.params.codeRegistryCodeValue;
      this.codeSchemeCodeValue = this.route.snapshot.params.codeSchemeCodeValue;
      this.dataService.getCodeRegistry(this.codeRegistryCodeValue).subscribe(codeRegistry => {
        this.codeRegistry = codeRegistry;
      });
      this.dataService.getCodeScheme(this.codeRegistryCodeValue, this.codeSchemeCodeValue).subscribe(codeScheme => {
        this.codeScheme = codeScheme;
      });
      this.dataService.getCodes(this.codeRegistryCodeValue, this.codeSchemeCodeValue).subscribe(codes => {
        this.codes = codes;
      });
    }
  }

  viewCode(code: Code) {
    console.log('View code: ' + code.codeValue);
    this.router.navigate(['/code',
      { codeRegistryCodeValue: this.codeRegistryCodeValue, codeSchemeCodeValue: this.codeSchemeCodeValue, codeCodeValue: code.codeValue }]);
  }

  createCode() {
    console.log('Create new code pressed!');
    this.router.navigate(['/code',
      { codeRegistryCodeValue: this.codeRegistryCodeValue, codeSchemeCodeValue: this.codeSchemeCodeValue }]);
  }

  back() {
    this.router.navigate(['/codeschemes',
      { codeRegistryCodeValue: this.codeRegistryCodeValue }]);
  }

}
