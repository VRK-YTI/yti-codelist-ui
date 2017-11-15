import { Component, Input } from '@angular/core';
import { CodeScheme } from '../../entities/code-scheme';
import { DataService } from '../../services/data.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-code-scheme-information',
  templateUrl: './code-scheme-information.component.html',
  styleUrls: ['./code-scheme-information.component.scss']
})
export class CodeSchemeInformationComponent {

  @Input() codeScheme: CodeScheme;

  modifyEnabled = false;
  storing = false;

  constructor(private dataService: DataService,
              private languageService: LanguageService) {
  }

  get contentLanguage() {
    return this.languageService.contentLanguage;
  }

  modify() {
    this.modifyEnabled = !this.modifyEnabled;
  }

  save() {
    this.storing = true;
    console.log('Store CodeScheme changes to server!');
    this.dataService.saveCodeScheme(this.codeScheme).subscribe(apiResponse => {
      if (apiResponse.meta != null) {
        console.log('Response status: ' + apiResponse.meta.code);
        console.log('Response message: ' + apiResponse.meta.message);
        if (apiResponse.meta.code !== 200) {
          console.log('Storing value failed, please try again.');
        }
      } else {
        console.log('Storing value failed, please try again.');
      }
      this.storing = false;
    });
  }

  cancel() {
    this.modifyEnabled = false;
  }
}
