import { Component, Input } from '@angular/core';
import { CodeScheme } from '../../entities/code-scheme';
import { DataService } from '../../services/data.service';
import { ConfigurationService } from '../../services/configuration.service';
import { CodeSchemeListItem } from '../../entities/code-scheme-list-item';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-code-scheme-versions',
  templateUrl: './code-scheme-versions.component.html',
  styleUrls: ['./code-scheme-versions.component.scss']
})
export class CodeSchemeVersionsComponent {

  @Input() codeScheme: CodeScheme;

  constructor(private languageService: LanguageService,
              private dataService: DataService,
              private configurationService: ConfigurationService) {
  }

  getVersionUri(versionUri: string) {
    return this.configurationService.getUriWithEnv(versionUri);
  }

  getVersionDisplayName(version: CodeSchemeListItem): string {
    return version.getDisplayName(this.languageService, false);
  }
}
