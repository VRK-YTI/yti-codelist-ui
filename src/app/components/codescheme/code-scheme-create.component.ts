import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CodeSchemeImportModalService } from './code-scheme-import-modal.component';

@Component({
  selector: 'app-code-scheme-create',
  templateUrl: './code-scheme-create.component.html',
  styleUrls: ['./code-scheme-create.component.scss']
})
export class CodeSchemeCreateComponent {

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
    // TODO
    console.log('Create new codescheme clicked!');
  }
}
