import { Component, OnInit } from '@angular/core';
import { CodeScheme } from '../../entities/code-scheme';
import { DataService } from '../../services/data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Code } from '../../entities/code';
import { LocationService } from '../../services/location.service';

@Component({
  selector: 'app-code-scheme',
  templateUrl: './code-scheme.component.html',
  styleUrls: ['./code-scheme.component.scss']
})
export class CodeSchemeComponent implements OnInit {

  codeScheme: CodeScheme;
  codes: Code[];

  constructor(private dataService: DataService,
              private route: ActivatedRoute,
              private router: Router,
              private locationService: LocationService) {
  }

  ngOnInit() {

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
  }

  get loading(): boolean {
    return this.codeScheme == null || this.codes == null;
  }

  back() {
    this.router.navigate(['frontpage']);
  }
}
