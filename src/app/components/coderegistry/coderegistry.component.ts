import { Component, OnInit } from '@angular/core';
import { CodeRegistry } from '../../model/coderegistry';
import { DataService } from '../../services/data.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-coderegistry',
  templateUrl: './coderegistry.component.html',
  styleUrls: ['./coderegistry.component.css']
})
export class CodeRegistryComponent implements OnInit {

  codeRegistry: CodeRegistry;
  codeRegistryCodeValue: string;

  constructor(private dataService: DataService,
              private route: ActivatedRoute,
              private router: Router) {
  }

  ngOnInit() {
    this.codeRegistryCodeValue = this.route.snapshot.params['codeRegistryCodeValue'];
    if (this.codeRegistryCodeValue != null) {
      this.dataService.getCodeRegistry(this.codeRegistryCodeValue).subscribe((codeRegistry) => {
        this.codeRegistry = codeRegistry;
      });
    }
  }

  back() {
     this.router.navigate(['coderegistries']);
  }

}
