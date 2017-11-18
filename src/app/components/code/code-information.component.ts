import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { Code } from '../../entities/code';
import { FormControl, FormGroup } from '@angular/forms';
import { EditableService } from '../../services/editable.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-code-information',
  templateUrl: './code-information.component.html',
  styleUrls: ['./code-information.component.scss']
})
export class CodeInformationComponent implements OnChanges, OnDestroy {

  @Input() code: Code;

  cancelSubscription: Subscription;

  codeForm = new FormGroup({
    prefLabels: new FormControl(''),
    descriptions: new FormControl(''),
    shortName: new FormControl('')
  });

  constructor(editableService: EditableService) {
    this.cancelSubscription = editableService.cancel$.subscribe(() => this.reset());
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.reset();
  }

  reset() {
    this.codeForm.reset(this.code);
  }


  ngOnDestroy() {
    this.cancelSubscription.unsubscribe();
  }
}
