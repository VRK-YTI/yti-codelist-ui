import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CodeSchemeImportModalService } from './code-scheme-import-modal.component';

@Component({
  selector: 'app-code-scheme-import-and-create',
  templateUrl: './code-scheme-import-and-create.component.html',
  styleUrls: ['./code-scheme-import-and-create.component.scss']
})
export class CodeSchemeImportAndCreateComponent {

  constructor(private router: Router,
              private codeSchemeImportModalService: CodeSchemeImportModalService) {
  }

  back() {
    this.router.navigate(['frontpage']);
  }

  importFromFile() {
    console.log('Importing codescheme from file!');
    this.codeSchemeImportModalService.open();
  }

  createNewCodeScheme() {
    console.log('Create new codescheme clicked!');
  }
}
