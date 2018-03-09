import { Component, Input } from '@angular/core';
import { Code } from '../../entities/code';
import { Router } from '@angular/router';
import { UserService } from 'yti-common-ui/services/user.service';
import { CodeSchemeCodesImportModalService } from './code-scheme-codes-import-modal.component';
import { CodeScheme } from '../../entities/code-scheme';
import { ignoreModalClose } from 'yti-common-ui/utils/modal';
import { DataService } from '../../services/data.service';
import { AuthorizationManager } from '../../services/authorization-manager.service';
import { contains } from 'yti-common-ui/utils/array';

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
          registryCode: this.codeScheme.codeRegistry.codeValue,
          schemeCode: this.codeScheme.codeValue
        }
      ]
    );
  }

  refreshCodes() {
    this.dataService.getCodes(this.codeScheme.codeRegistry.codeValue, this.codeScheme.codeValue).subscribe(codes => {
      this.codes = codes;
    });
  }

  canAddCode() {
    return this.authorizationManager.canEdit(this.codeScheme) && !this.codeScheme.restricted;
  }

  get topLevelCodes() {
    return this.codes.filter(code => !code.broaderCodeId);
  }

  get parentCodes() {
    const childCodes = this.codes.filter(code => code.broaderCodeId != null);
    const broaderCodeIds = childCodes.map(code => code.broaderCodeId);

    return this.codes.filter(code => contains(broaderCodeIds, code.id));
  }

  hasHierarchy() {
    return this.codes.filter(code => code.broaderCodeId !== undefined).length > 0;
  }

  get numberOfExpanded() {
    return this.parentCodes.filter(code => code.expanded).length;
  }

  get numberOfCollapsed() {
    return this.parentCodes.filter(code => !code.expanded).length;
  }

  hasExpanded() {
    return this.numberOfExpanded > 0;
  }

  hasCollapsed() {
    return this.numberOfCollapsed > 0;
  }

  expandAll() {
    this.codes.map(code => {
      if (contains(this.parentCodes, code)) {
        code.expanded = true;
      }
    });
  }

  collapseAll() {
    this.codes.map(code => {
      if (contains(this.parentCodes, code)) {
        code.expanded = false;
      }
    });
  }
}
