import { Component, Input, Optional, Self } from '@angular/core';
import { Code } from '../../entities/code';
import { EditableService } from '../../services/editable.service';
import { ControlValueAccessor, FormControl, NgControl } from '@angular/forms';
import { ignoreModalClose } from 'yti-common-ui/utils/modal';
import { SearchLinkedCodeModalService } from './search-linked-code-modal.component';
import { comparingPrimitive } from 'yti-common-ui/utils/comparator';
import { DataService } from '../../services/data.service';
import { Observable } from 'rxjs';
import { TranslateService } from 'ng2-translate';
import { CodePlain } from '../../entities/code-simple';

function addToControl<T>(control: FormControl, itemToAdd: T) {

  const previous = control.value as T[];
  control.setValue([...previous, itemToAdd]);
}

function removeFromControl<T>(control: FormControl, itemToRemove: T) {

  const previous = control.value as T[];
  control.setValue(previous.filter(item => item !== itemToRemove));
}

@Component({
  selector: 'app-classifications-input',
  template: `
    <dl *ngIf="editing || dataClassifications.length > 0">
      <dt>
        <label>{{label}}</label>
        <app-required-symbol *ngIf="required && editing"></app-required-symbol>
      </dt>
      <dd>
        <div *ngIf="!editing">
          <div *ngFor="let dataClassification of dataClassifications">
            <span>{{dataClassification.prefLabel | translateValue:true}}</span>
          </div>
        </div>
        <div *ngIf="editing">
          <div *ngFor="let classification of dataClassifications">
            <a>
              <i [id]="'remove_' + classification.codeValue + '_classification_link'"
                 class="fa fa-times"
                 (click)="removeDataClassification(classification)"></i>
            </a>
            <span>{{classification.prefLabel | translateValue:true}}</span>
          </div>
          <app-error-messages id="classification_error_messages" [control]="parentControl"></app-error-messages>
        </div>

        <button id="add_classification_button"
                type="button"
                class="btn btn-sm btn-action mt-2"
                *ngIf="editing"
                (click)="addDataClassification()" translate>Add classification
        </button>
      </dd>
    </dl>
  `
})
export class ClassificationsInputComponent implements ControlValueAccessor {

  @Input() label: string;
  @Input() restrict = false;
  @Input() required = false;
  control = new FormControl([]);

  classifications$: Observable<Code[]>;

  private propagateChange: (fn: any) => void = () => {};
  private propagateTouched: (fn: any) => void = () => {};

  constructor(@Self() @Optional() public parentControl: NgControl,
              private editableService: EditableService,
              private translateService: TranslateService,
              private dataService: DataService,
              private searchLinkedCodeModalService: SearchLinkedCodeModalService) {


    this.control.valueChanges.subscribe(x => this.propagateChange(x));

    if (parentControl) {
      parentControl.valueAccessor = this;
    }

    this.classifications$ = this.dataService.getDataClassificationsAsCodes();
  }

  get dataClassifications(): CodePlain[] {
    return (this.control.value as CodePlain[]).sort(comparingPrimitive<Code>(classification => classification.codeValue));
  }

  addDataClassification() {
    const titleLabel = this.translateService.instant('Choose classification');
    const searchlabel = this.translateService.instant('Search classification');
    const restrictIds = this.dataClassifications.map(classification => classification.id);

    this.searchLinkedCodeModalService.open(this.classifications, titleLabel, searchlabel, restrictIds, true)
      .then(classification => addToControl(this.control, classification), ignoreModalClose);
  }

  removeDataClassification(classification: CodePlain) {
    removeFromControl(this.control, classification);
  }

  get classifications() {
    return this.classifications$;
  }

  get editing() {
    return this.editableService.editing && !this.restrict;
  }

  writeValue(obj: any): void {
    this.control.setValue(obj);
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.propagateTouched = fn;
  }
}
