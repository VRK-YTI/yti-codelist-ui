import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Code } from '../../entities/code';
import { FormControl, FormGroup } from '@angular/forms';
import { EditableService } from '../../services/editable.service';

@Component({
  selector: 'app-code-information',
  templateUrl: './code-information.component.html',
  styleUrls: ['./code-information.component.scss']
})
export class CodeInformationComponent implements OnChanges {

  @Input() code: Code;

  codeForm = new FormGroup({
    prefLabels: new FormControl(''),
    descriptions: new FormControl(''),
    shortName: new FormControl('')
  });

  constructor(editableService: EditableService) {
    editableService.onCancel = () => this.reset();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.reset();
  }

  reset() {
    this.codeForm.reset(this.code);
  }
}
