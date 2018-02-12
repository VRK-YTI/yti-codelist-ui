import {Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { CodeSchemeImportModalService } from './code-scheme-import-modal.component';
import {DataService} from '../../services/data.service';
import {CodeRegistry} from '../../entities/code-registry';

@Component({
  selector: 'app-code-scheme-import-and-create',
  templateUrl: './code-scheme-import-and-create.component.html',
  styleUrls: ['./code-scheme-import-and-create.component.scss']
})
export class CodeSchemeImportAndCreateComponent implements OnInit {

  codeRegistries: CodeRegistry[];

  constructor(private router: Router,
              private dataService: DataService,
              private codeSchemeImportModalService: CodeSchemeImportModalService) {
  }

  ngOnInit() {
    this.dataService.getCodeRegistriesForUser().subscribe(codeRegistries => {
      this.codeRegistries = codeRegistries;
    });
  }

  back() {
    this.router.navigate(['frontpage']);
  }

  importFromFile() {
    console.log('Importing code list from file!');
    this.codeSchemeImportModalService.open();
  }

  createNewCodeScheme() {
    console.log('Create new code list clicked!');
    this.router.navigate(['createcodescheme']);
  }
}
