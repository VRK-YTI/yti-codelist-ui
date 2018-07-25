import {Component, Input} from '@angular/core';
import {CodeScheme} from '../../entities/code-scheme';
import {ignoreModalClose} from 'yti-common-ui/utils/modal';
import {CodeschemeVariantModalService} from '../codeschemevariant/codescheme-variant.modal.component';
import {DataService} from '../../services/data.service';
import {CodeSchemeListItem} from '../../entities/code-scheme-list-item';

@Component({
  selector: 'app-code-scheme-variants',
  templateUrl: './code-scheme-variants.component.html',
  styleUrls: ['./code-scheme-variants.component.scss']
})
export class CodeSchemeVariantsComponent {

  @Input() codeScheme: CodeScheme;
  chosenCodeScheme: CodeScheme;

  constructor(private codeschemeVariantModalService: CodeschemeVariantModalService,
              private dataService: DataService) {

  }
  openVariantSearchModal() {
    this.codeschemeVariantModalService.open()
      .then(codeScheme => this.putChosenVariantStuffInPlace(codeScheme), ignoreModalClose);
  }

  putChosenVariantStuffInPlace(chosenVariantCodeScheme: CodeScheme) {
    this.chosenCodeScheme = chosenVariantCodeScheme;

    return this.dataService.attachAVariantToCodeScheme(this.codeScheme.codeRegistry, chosenVariantCodeScheme.id, this.codeScheme)
      .subscribe(resultCodeScheme => {
        if (this.codeScheme.variantsOfThisCodeScheme) {
          this.codeScheme.variantsOfThisCodeScheme.push(
            new CodeSchemeListItem( { prefLabel: this.chosenCodeScheme.prefLabel, uri: this.chosenCodeScheme.uri } )
          );
        }
      });
  }
}
