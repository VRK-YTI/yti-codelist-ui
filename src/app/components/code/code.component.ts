import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import { Code } from '../../entities/code';
import { ActivatedRoute, Router } from '@angular/router';
import { LocationService } from '../../services/location.service';
import { LanguageService } from '../../services/language.service';

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
  codeId: string;
  modifyEnabled: boolean;
  storing: boolean;

  constructor(private dataService: DataService,
              private route: ActivatedRoute,
              private router: Router,
              private locationService: LocationService,
              private languageService: LanguageService) {
  }

  ngOnInit() {
    if (this.route != null) {
      this.codeCodeValue = this.route.snapshot.params.codeCodeValue;
      this.codeId = this.route.snapshot.params.codeId;
      this.codeRegistryCodeValue = this.route.snapshot.params.codeRegistryCodeValue;
      this.codeSchemeCodeValue = this.route.snapshot.params.codeSchemeCodeValue;
      this.dataService.getCode(this.codeRegistryCodeValue, this.codeSchemeCodeValue, this.codeId).subscribe(code => {
        this.code = code;
        this.locationService.atCodePage(code);
      });
      this.storing = false;
    }
  }

  get contentLanguage() {
    return this.languageService.contentLanguage;
  }

  get loading(): boolean {
    return this.code == null;
  }

  back() {
    this.router.navigate(['codescheme',
      { codeRegistryCodeValue: this.codeRegistryCodeValue, codeSchemeCodeValue: this.codeSchemeCodeValue }]);
  }

  modify() {
    this.modifyEnabled = !this.modifyEnabled;
  }

  save() {
    this.storing = true;
    console.log('Store Code changes to server!');
    this.dataService.saveCode(this.code).subscribe( apiResponse => {
      if (apiResponse.meta != null) {
        console.log('Response status: ' + apiResponse.meta.code);
        console.log('Response message: ' + apiResponse.meta.message);
        if (apiResponse.meta.code !== 200) {
          console.log('Storing value failed, please try again.');
        }
      } else {
        console.log('Storing value failed, please try again.');
      }
      this.storing = false;
    });
  }

  cancel() {
    this.modifyEnabled = false;
  }
}
