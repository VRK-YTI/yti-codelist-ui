import { Component, Input } from '@angular/core';
import { Code } from '../../entities/code';
import { DataService } from '../../services/data.service';
import { EditableService } from '../../services/editable.service';

@Component({
  selector: 'app-code-information',
  templateUrl: './code-information.component.html',
  styleUrls: ['./code-information.component.scss'],
  providers: [EditableService]
})
export class CodeInformationComponent {

  @Input() code: Code;

  constructor(private dataService: DataService,
              private editableService: EditableService) {

    editableService.onSave = () => this.save();
    editableService.onCanceled = () => this.cancel();
  }

  save() {
    console.log('Store Code changes to server!');
    return this.dataService.saveCode(this.code);
  }

  cancel() {
  }
}
