import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CodeSchemeImportModalService } from './code-scheme-import-modal.component';
import { LocationService } from '../../services/location.service';

@Component({
  selector: 'app-code-scheme-import-and-create',
  templateUrl: './code-scheme-import-and-create.component.html',
  styleUrls: ['./code-scheme-import-and-create.component.scss']
})
export class CodeSchemeImportAndCreateComponent implements OnInit {

  constructor(private router: Router,
              private codeSchemeImportModalService: CodeSchemeImportModalService,
              private locationService: LocationService) {
  }


  ngOnInit() {
    this.locationService.atCodeSchemeImportAndCreatePage();
  }

  back() {
    this.router.navigate(['frontpage']);
  }

  importFromFile() {
    console.log('Importing code list from file!');
    this.codeSchemeImportModalService.open(false, null);
  }

  createNewCodeScheme() {
    console.log('Create new code list clicked!');
    this.router.navigate(['createcodescheme']);
  }
}
