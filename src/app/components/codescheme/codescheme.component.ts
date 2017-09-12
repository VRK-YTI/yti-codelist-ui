import { Component, OnInit } from '@angular/core';
import { CodeScheme } from '../../model/codescheme';
import { DataService } from '../../services/data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CodeRegistry } from '../../model/coderegistry';

@Component({
  selector: 'app-codescheme',
  templateUrl: './codescheme.component.html',
  styleUrls: ['./codescheme.component.css']
})
export class CodeSchemeComponent implements OnInit {

  codeScheme: CodeScheme;
  codeRegistry: CodeRegistry;
  codeRegistryCodeValue: string;
  codeSchemeCodeValue: string;

  constructor(private dataService: DataService,
              private route: ActivatedRoute,
              private router: Router) { }

  ngOnInit() {
    if (this.route != null) {
      this.codeRegistryCodeValue = this.route.snapshot.params['codeRegistryCodeValue'];
      this.codeSchemeCodeValue = this.route.snapshot.params['codeSchemeCodeValue'];
      if (this.codeRegistryCodeValue != null && this.codeSchemeCodeValue != null) {
        this.dataService.getCodeRegistry(this.codeRegistryCodeValue).subscribe((codeRegistry) => {
          this.codeRegistry = codeRegistry;
        });
        this.dataService.getCodeScheme(this.codeRegistryCodeValue, this.codeSchemeCodeValue).subscribe((codeScheme) => {
          this.codeScheme = codeScheme;
        });
      }
    }
  }

  back() {
    this.router.navigate(['/codeschemes', { codeRegistryCodeValue: this.codeRegistryCodeValue }]);
  }

}
