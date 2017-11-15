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
  }

  save() {

    const that = this;
    this.editableService.saving = true;

    console.log('Store Code changes to server!');
    this.dataService.saveCode(this.code).subscribe({
        next(response) {

          if (response.meta != null) {
            console.log('Response status: ' + response.meta.code);
            console.log('Response message: ' + response.meta.message);
            if (response.meta.code !== 200) {
              console.log('Storing value failed, please try again.');
            }
          } else {
            console.log('Storing value failed, please try again.');
          }

          that.editableService.saving = false;
          that.editableService.editing = false;
        },
        error() {
          that.editableService.saving = false;
        }
      }
    );
  }

  get editing() {
    return this.editableService.editing;
  }

  get saving() {
    return this.editableService.saving;
  }

  canEdit() {
    return !this.editing;
  }

  canSave() {
    return this.editing;
  }

  canCancel() {
    return this.editing;
  }

  edit() {
    this.editableService.editing = true;
  }

  cancel() {
    this.editableService.editing = false;
  }
}
