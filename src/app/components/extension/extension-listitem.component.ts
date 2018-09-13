import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { TranslateService } from '@ngx-translate/core';
import { ExtensionSimple } from '../../entities/extension-simple';
import { ExtensionScheme } from '../../entities/extension-scheme';

@Component({
  selector: 'app-extension-listitem',
  styleUrls: ['./extension-listitem.component.scss'],
  template: `
    <div id="{{getIdIdentifier() + '_view_extension'}}"
         class="extension"
         (click)="viewExtension()">
      <span class="extensiontitle">{{extension.getDisplayName(languageService, translateService)}}</span>
    </div>
  `
})

export class ExtensionListitemComponent {

  @Input() extensionScheme: ExtensionScheme;
  @Input() extension: ExtensionSimple;

  constructor(private router: Router,
              public languageService: LanguageService,
              public translateService: TranslateService) {
  }

  viewExtension() {
    console.log('View member: ' + this.extension.id);
    this.router.navigate([
      'extension',
      {
        registryCode: this.extensionScheme.parentCodeScheme.codeRegistry.codeValue,
        schemeCode: this.extensionScheme.parentCodeScheme.codeValue,
        extensionSchemeCode: this.extensionScheme.codeValue,
        extensionId: this.extension.id
      }
    ]);
  }

  getIdIdentifier() {
    return `${this.extension.id}`;
  }
}
