import { Component, OnInit } from '@angular/core';
import { CodeScheme } from '../../entities/code-scheme';
import { DataService } from '../../services/data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Code } from '../../entities/code';
import { LocationService } from '../../services/location.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-code-scheme',
  templateUrl: './code-scheme.component.html',
  styleUrls: ['./code-scheme.component.scss']
})
export class CodeSchemeComponent implements OnInit {

  codeScheme: CodeScheme;
  codes: Code[];
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

      const registryCode = this.route.snapshot.params.codeRegistryCodeValue;
      const schemeCode = this.route.snapshot.params.codeSchemeCodeValue;

      if (!registryCode || !schemeCode) {
        throw new Error(`Illegal route, registry: '${registryCode}', scheme: '${schemeCode}'`);
      }

      this.dataService.getCodeScheme(registryCode, schemeCode).subscribe(codeScheme => {
        this.codeScheme = codeScheme;
        this.locationService.atCodeSchemePage(codeScheme);
      });

      this.dataService.getCodes(registryCode, schemeCode).subscribe(codes => {
        this.codes = codes;
      });

      this.storing = false;
    }
  }

  get contentLanguage() {
    return this.languageService.contentLanguage;
  }

  get loading(): boolean {
    return this.codeScheme == null || this.codes == null;
  }

  viewCode(code: Code) {
    console.log('View code: ' + code.codeValue);
    this.router.navigate(code.route);
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

  back() {
    this.router.navigate(['frontpage']);
  }
}
