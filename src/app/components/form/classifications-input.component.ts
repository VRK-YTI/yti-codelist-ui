import { Component, Input, Self, Optional } from '@angular/core';
import { Code } from '../../entities/code';
import { EditableService } from '../../services/editable.service';
import { ControlValueAccessor, FormControl, NgControl } from '@angular/forms';
import { ignoreModalClose } from 'yti-common-ui/utils/modal';
import { SearchClassificationModalService } from './search-classification-modal.component';
import { LanguageService } from '../../services/language.service';
import { remove } from 'yti-common-ui/utils/array';

@Component({
  selector: 'app-classifications-input',
  template: `
    <dl *ngIf="editing || dataClassifications.length > 0">
      <dt>
        <label>{{label}}</label>
      </dt>
      <dd>
        <div *ngIf="!editing">
          <div *ngFor="let dataClassification of dataClassifications">  
            <span>{{dataClassification.prefLabel | translateValue:true}}</span>
          </div>
        </div>
        <div *ngIf="editing">
          <div *ngFor="let classification of dataClassifications">
            <a><i class="fa fa-times" (click)="removeDataClassification(classification)"></i></a>
            <span>{{classification.prefLabel | translateValue:true}}</span>
          </div>
        </div>

        <button type="button"
                class="btn btn-sm btn-action mt-2"
                *ngIf="editing"
                (click)="addDataClassification()" translate>Add classification</button>
      </dd>
    </dl>
  `
})
export class ClassificationsInputComponent implements ControlValueAccessor {

  @Input() label: string;
  @Input() restrict = false;
  control = new FormControl([]);

  private propagateChange: (fn: any) => void = () => {};
  private propagateTouched: (fn: any) => void = () => {};

  constructor(@Self() @Optional() public parentControl: NgControl,
              private editableService: EditableService,
              public languageService: LanguageService,
              private searchClassificationModalService: SearchClassificationModalService) {


    this.control.valueChanges.subscribe(x => this.propagateChange(x));

    if (parentControl) {
      parentControl.valueAccessor = this;
    }
  }

  get dataClassifications(): Code[] {
    return this.control.value;
  }

  addDataClassification() {

    const restrictIds = this.dataClassifications.map(classification => classification.id);

    this.searchClassificationModalService.open(restrictIds)
      .then(classification => this.dataClassifications.push(classification), ignoreModalClose);
  }

  removeDataClassification(classification: Code) {
    remove(this.dataClassifications, classification);
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
