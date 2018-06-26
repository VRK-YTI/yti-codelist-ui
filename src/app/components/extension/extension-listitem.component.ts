import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Extension } from '../../entities/extension';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-extension-listitem',
  styleUrls: ['./extension-listitem.component.scss'],
  template: `
    <div id="{{getIdIdentifier(extension) + '_view_extension'}}"
         class="extension"
         (click)="viewExtension(extension)">
      <span class="extensiontitle">{{extension.getDisplayName(languageService)}}</span>
    </div>
  `
})

export class ExtensionListitemComponent {

  @Input() extension: Extension;

  constructor(private router: Router,
              public languageService: LanguageService) {
  }

  viewExtension(extension: Extension) {
    console.log('View extension: ' + extension.id);
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
