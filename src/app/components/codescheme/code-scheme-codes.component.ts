import { Component, Input } from '@angular/core';
import { Code } from '../../entities/code';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { CodeSchemeCodesImportModalService } from './code-scheme-codes-import-modal.component';
import { CodeScheme } from '../../entities/code-scheme';

@Component({
  selector: 'app-code-scheme-codes',
  templateUrl: './code-scheme-codes.component.html',
  styleUrls: ['./code-scheme-codes.component.scss']
})
export class CodeSchemeCodesComponent {

  @Input() codes: Code[];
  @Input() codeScheme: CodeScheme;

  constructor(private userService: UserService,
              private codeSchemeCodesImportModalService: CodeSchemeCodesImportModalService,
              private router: Router) {
  }

  viewCode(code: Code) {
    console.log('View code: ' + code.codeValue);
    this.router.navigate(code.route);
  }

  importCodes() {
    console.log('Import codes pressed!');
    this.codeSchemeCodesImportModalService.open(this.codeScheme);
  }

  isLoggedIn() {
    return this.userService.isLoggedIn();
  }
}
