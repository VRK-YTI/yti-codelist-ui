import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Extension } from '../../entities/extension';
import { LanguageService } from '../../services/language.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-extension-listitem',
  styleUrls: ['./extension-listitem.component.scss'],
  template: `
    <div id="{{getIdIdentifier(extension) + '_view_extension'}}"
         class="extension"
         (click)="viewExtension(extension)">
      <span class="extensiontitle">{{extension.getDisplayName(languageService, translateService)}}</span>
    </div>
  `
})

export class ExtensionListitemComponent {

  @Input() extension: Extension;

  constructor(private router: Router,
              public languageService: LanguageService,
              public translateService: TranslateService) {
  }

  viewExtension(extension: Extension) {
    console.log('View member: ' + extension.id);
    this.router.navigate([
      'extension',
      {
        registryCode: extension.extensionScheme.parentCodeScheme.codeRegistry.codeValue,
        schemeCode: extension.extensionScheme.parentCodeScheme.codeValue,
        extensionSchemeCode: extension.extensionScheme.codeValue,
        extensionId: extension.id
      }
    ]);
  }

  getIdIdentifier(extension: Extension) {
    return `${this.extension.id}`;
  }
}
