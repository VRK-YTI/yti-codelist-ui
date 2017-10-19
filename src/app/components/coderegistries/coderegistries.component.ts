import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import { CodeRegistry } from '../../model/coderegistry';
import { Router } from '@angular/router';

@Component({
  selector: 'app-coderegistries',
  templateUrl: './coderegistries.component.html',
  styleUrls: ['./coderegistries.component.css']
})
export class CodeRegistriesComponent implements OnInit {

  codeRegistries: CodeRegistry[];

  constructor(private dataService: DataService,
              private router: Router) {
  }

  ngOnInit() {
    if (this.dataService != null) {
      this.dataService.getCodeRegistries().subscribe(codeRegistries => {
        this.codeRegistries = codeRegistries;
      });
    }
  }

  viewCodeSchemes(codeRegistry: CodeRegistry) {
    console.log('Viewing code schemes for coderegistry: ' + codeRegistry.codeValue);
    this.router.navigate(['/codeschemes', { codeRegistryCodeValue: codeRegistry.codeValue }]);
  }

  viewCodeRegistry(codeRegistry: CodeRegistry) {
    console.log('Viewing coderegistry: ' + codeRegistry.codeValue);
    this.router.navigate(['/coderegistry', { codeRegistryCodeValue: codeRegistry.codeValue }]);
  }

  createCodeRegistry() {
    console.log('Create new coderegistry pressed!');
    this.router.navigate(['/coderegistry']);
  }

}
