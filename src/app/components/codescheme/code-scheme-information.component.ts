import { Component, Input } from '@angular/core';
import { CodeScheme } from '../../entities/code-scheme';
import { DataService } from '../../services/data.service';
import { EditableService } from '../../services/editable.service';

@Component({
  selector: 'app-code-scheme-information',
  templateUrl: './code-scheme-information.component.html',
  styleUrls: ['./code-scheme-information.component.scss']
})
export class CodeSchemeInformationComponent {

  @Input() codeScheme: CodeScheme;

  constructor(private dataService: DataService,
              private editableService: EditableService) {

    editableService.onSave = () => this.save();
    editableService.onCanceled = () => this.cancel();
  }

  save() {
    console.log('Store CodeScheme changes to server!');
    return this.dataService.saveCodeScheme(this.codeScheme);
  }

  cancel() {
  }
}
