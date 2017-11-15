import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import { Code } from '../../entities/code';
import { ActivatedRoute, Router } from '@angular/router';
import { LocationService } from '../../services/location.service';

@Component({
  selector: 'app-code',
  templateUrl: './code.component.html',
  styleUrls: ['./code.component.scss']
})
export class CodeComponent implements OnInit {

  code: Code;

  constructor(private dataService: DataService,
              private route: ActivatedRoute,
              private router: Router,
              private locationService: LocationService) {
  }

  ngOnInit() {

    const codeId = this.route.snapshot.params.codeId;
    const registryCode = this.route.snapshot.params.codeRegistryCodeValue;
    const schemeCode = this.route.snapshot.params.codeSchemeCodeValue;

    if (!codeId || !registryCode || !schemeCode) {
      throw new Error(`Illegal route, codeId: '${codeId}', registry: '${registryCode}', scheme: '${schemeCode}'`);
    }

    this.dataService.getCode(registryCode, schemeCode, codeId).subscribe(code => {
      this.code = code;
      this.locationService.atCodePage(code);
    });
  }

  get loading(): boolean {
    return this.code == null;
  }

  back() {
    this.router.navigate(this.code.codeScheme.route);
  }
}
