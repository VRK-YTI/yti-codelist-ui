import { Component, OnInit } from '@angular/core';
import { CodeScheme } from '../../model/codescheme';
import { DataService } from '../../services/data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Code } from '../../model/code';
import { LocationService } from '../../services/location.service';
import { Language, LanguageService } from '../../services/language.service';

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
  nav: string;
  modifyEnabled: boolean;
  storing: boolean;
  modifyLanguage: string;

  languages = [
    { code: 'fi' as Language, name: 'Suomeksi (FI)' },
    { code: 'sv' as Language, name: 'På svenska (SV)' },
    { code: 'en' as Language, name: 'In English (EN)' }
  ];

  constructor(private dataService: DataService,
              private route: ActivatedRoute,
              private router: Router,
              private locationService: LocationService,
              private languageService: LanguageService) {
    this.modifyLanguage = languageService.language;
  }

  ngOnInit() {
    if (this.route != null) {
      this.codeRegistryCodeValue = this.route.snapshot.params.codeRegistryCodeValue;
      this.codeSchemeCodeValue = this.route.snapshot.params.codeSchemeCodeValue;
      if (this.codeRegistryCodeValue != null && this.codeSchemeCodeValue != null) {
        this.dataService.getCodeScheme(this.codeRegistryCodeValue, this.codeSchemeCodeValue).subscribe(codeScheme => {
          this.codeScheme = codeScheme;
          if (this.codeScheme.descriptions == null) {
            this.codeScheme.descriptions = {fi: '', sv: '', en: ''};
          } else {
            if (this.codeScheme.descriptions.fi == null) {
              this.codeScheme.descriptions.fi = '';
            }
            if (this.codeScheme.descriptions.sv == null) {
              this.codeScheme.descriptions.sv = '';
            }
            if (this.codeScheme.descriptions.en == null) {
              this.codeScheme.descriptions.en = '';
            }
          }
          if (this.codeScheme.definitions == null) {
            this.codeScheme.definitions = {fi: '', sv: '', en: ''};
          } else {
            if (this.codeScheme.definitions.fi == null) {
              this.codeScheme.definitions.fi = '';
            }
            if (this.codeScheme.definitions.sv == null) {
              this.codeScheme.definitions.sv = '';
            }
            if (this.codeScheme.definitions.en == null) {
              this.codeScheme.definitions.en = '';
            }
          }
          this.locationService.atCodeSchemePage(codeScheme);
        });
        this.dataService.getCodes(this.codeRegistryCodeValue, this.codeSchemeCodeValue).subscribe(codes => {
          this.codes = codes;
        });
      }
      this.nav = 'codes';
      this.storing = false;
    }
  }

  get loading(): boolean {
    return this.codeScheme == null || this.codes == null;
  }

  viewCode(code: Code) {
    console.log('View code: ' + code.codeValue);
    this.router.navigate(['code',
      {
        codeRegistryCodeValue: code.codeScheme.codeRegistry.codeValue,
        codeSchemeCodeValue: code.codeScheme.codeValue,
        codeCodeValue: code.codeValue,
        codeId: code.id
      }]);
  }

  modify() {
    this.modifyEnabled = !this.modifyEnabled;
  }

  save() {
    this.storing = true;
    console.log('Store CodeScheme changes to server!');
    this.dataService.saveCodeScheme(this.codeScheme).subscribe(apiResponse => {
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

  showTab(value: string) {
    this.nav = value;
  }

  back() {
    this.router.navigate(['frontpage', {}]);
  }

  setModifyLanguage(language: Language) {
    this.modifyLanguage = language;
  }
}
