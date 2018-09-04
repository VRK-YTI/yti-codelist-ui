import {Component, Input} from '@angular/core';
import {CodeScheme} from '../../entities/code-scheme';
import {DataService} from "../../services/data.service";

@Component({
  selector: 'app-code-scheme-versions',
  templateUrl: './code-scheme-versions.component.html',
  styleUrls: ['./code-scheme-versions.component.scss']
})
export class CodeSchemeVersionsComponent {

  @Input() codeScheme: CodeScheme;

  env: string;

  constructor(private dataService: DataService) {
    dataService.getServiceConfiguration().subscribe(configuration => {
      this.env = configuration.env;
    });
  }

  getVersionUri(versionUri: string) {
    if (this.env !== 'prod') {
      return versionUri + '?env=' + this.env;
    }
    return versionUri;
  }
}
