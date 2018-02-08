import { Component, Input } from '@angular/core';
import { Code } from '../../entities/code';
import { Router } from '@angular/router';
import { UserService } from 'yti-common-ui/services/user.service';
import { CodeSchemeCodesImportModalService } from './code-scheme-codes-import-modal.component';
import { CodeScheme } from '../../entities/code-scheme';
import { ignoreModalClose } from 'yti-common-ui/utils/modal';
import { DataService } from '../../services/data.service';
import { AuthorizationManager } from '../../services/authorization-manager.service';

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
              private dataService: DataService,
              private router: Router,
              private authorizationManager: AuthorizationManager) {
  }

  viewCode(code: Code) {
    console.log('View code: ' + code.codeValue);
    this.router.navigate(code.route);
  }

  importCodes() {
    this.codeSchemeCodesImportModalService.open(this.codeScheme).then(success => {
      if (success) {
        this.refreshCodes();
      }
    }, ignoreModalClose);
  }

  createCode() {
    this.router.navigate(
      ['createcode',
        {
          codeRegistryCodeValue: this.codeScheme.codeRegistry.codeValue,
          codeSchemeId: this.codeScheme.id
        }
      ]
    );
  }

  refreshCodes() {
    this.dataService.getCodes(this.codeScheme.codeRegistry.codeValue, this.codeScheme.id).subscribe(codes => {
      this.codes = codes;
    });
  }

  canAddCode() {
    return this.authorizationManager.canEdit(this.codeScheme) && !this.codeScheme.restricted;
  }
}
