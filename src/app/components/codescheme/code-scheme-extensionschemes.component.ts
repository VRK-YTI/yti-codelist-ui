import { Component, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CodeScheme } from '../../entities/code-scheme';
import { AuthorizationManager } from '../../services/authorization-manager.service';
import { CodeSchemeComponent } from './code-scheme.component';
import { ExtensionScheme, groupByType, PropertyTypeExtensionSchemes } from '../../entities/extension-scheme';
import { ExtensionSchemesImportModalService } from '../extensionscheme/extension-scheme-import-modal.component';
import { NgbTabset } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-code-scheme-extensionschemes',
  templateUrl: './code-scheme-extensionschemes.component.html',
  styleUrls: ['./code-scheme-extensionschemes.component.scss']
})
export class CodeSchemeExtensionSchemesComponent {
  @ViewChild('secondaryTabSet') secondaryTabSet: NgbTabset;

  @Input() extensionSchemes: ExtensionScheme[];
  @Input() codeScheme: CodeScheme;

  constructor(private codeSchemeComponent: CodeSchemeComponent,
              private extensionSchemesImportModalService: ExtensionSchemesImportModalService,
              private router: Router,
              private authorizationManager: AuthorizationManager,
              private translateService: TranslateService) {
  }

  get extensionSchemesByType(): PropertyTypeExtensionSchemes[] {
    return groupByType(this.translateService, this.extensionSchemes);
  }
}
