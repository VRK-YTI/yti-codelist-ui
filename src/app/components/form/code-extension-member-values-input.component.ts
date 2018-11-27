import { Component, Input, Optional, Self } from '@angular/core';
import { EditableService } from '../../services/editable.service';
import { FormArray, FormGroup, NgControl } from '@angular/forms';
import { LanguageService } from '../../services/language.service';
import { ExtensionSimple } from '../../entities/extension-simple';

@Component({
  selector: 'app-code-extension-membervalues-input',
  styleUrls: ['./code-extension-member-values-input.component.scss'],
  template: `
    <dt>
      <label class="extension-heading">{{extension.getDisplayName(languageService)}}</label>
    </dt>
    <div>
      <div [formGroup]="extensionGroup">
        <div formArrayName="members" *ngFor="let member of members.controls as FormArray; let i = index">
          <div [formGroupName]="i">
            <div formArrayName="memberValues" *ngFor="let memberValue of getMemberValuesArray(i).controls; let j = index">
              <div [formGroupName]="j">
                <app-literal-input
                  [id]="'code_inline_membervalue_' + extension.codeValue + '_' + memberValue.value.valueType.localName + ' _input'"
                  [label]="memberValue.value.valueType.prefLabel | translateValue"
                  [required]="memberValue.value.valueType.required"
                  [showEmptyValue]="true"
                  [formControlName]="'value'"></app-literal-input>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CodeExtensionMemberValuesInputComponent {

  @Input() label: string;
  @Input() extension: ExtensionSimple;
  @Input() extensionGroup: FormGroup;

  constructor(@Self() @Optional() public parentControl: NgControl,
              private editableService: EditableService,
              public languageService: LanguageService) {
  }

  getMemberValuesArray(i: number): FormArray {
    const memberGroup: FormGroup = this.members.at(i) as FormGroup;
    const memberValueFormArray: FormArray = memberGroup.get('memberValues') as FormArray;
    return memberValueFormArray;
  }

  get members(): FormArray {
    return this.extensionGroup.get('members') as FormArray;
  }

  get editing() {
    return this.editableService.editing;
  }
}
