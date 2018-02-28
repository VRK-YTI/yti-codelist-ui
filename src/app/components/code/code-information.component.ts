import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { Code } from '../../entities/code';
import { FormControl, FormGroup } from '@angular/forms';
import { EditableService } from '../../services/editable.service';
import { Subscription } from 'rxjs/Subscription';
import { LanguageService } from '../../services/language.service';
import { validDateRange } from '../../utils/date';

@Component({
  selector: 'app-code-information',
  templateUrl: './code-information.component.html',
  styleUrls: ['./code-information.component.scss']
})
export class CodeInformationComponent implements OnChanges, OnDestroy {

  @Input() code: Code;

  cancelSubscription: Subscription;

  codeForm = new FormGroup({
    prefLabel: new FormControl(''),
    description: new FormControl(''),
    shortName: new FormControl(''),
    externalReferences: new FormControl(),
    validity: new FormControl(null, validDateRange),
    status: new FormControl()
  });

  constructor(private editableService: EditableService,
              public languageService: LanguageService) {

    this.cancelSubscription = editableService.cancel$.subscribe(() => this.reset());
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.reset();
  }

  reset() {
    const { externalReferences, startDate, endDate, ...rest } = this.code;

    this.codeForm.reset({
      ...rest,
      validity: { start: startDate, end: endDate },
      externalReferences: externalReferences.map(link => link.clone())
    });
  }

  get editing() {
    return this.editableService.editing;
  }

  get restricted() {
    return this.code.restricted;
  }

  ngOnDestroy() {
    this.cancelSubscription.unsubscribe();
  }
}
