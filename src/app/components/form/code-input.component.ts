import { Component, Input, Optional, Self } from '@angular/core';
import { EditableService } from '../../services/editable.service';
import { ControlValueAccessor, FormControl, NgControl } from '@angular/forms';
import { SearchLinkedCodeModalService } from './search-linked-code-modal.component';
import { DataService } from '../../services/data.service';
import { TranslateService } from '@ngx-translate/core';
import { CodeScheme } from '../../entities/code-scheme';
import { LanguageService } from '../../services/language.service';
import { Code } from '../../entities/code';
import { ignoreModalClose } from '@vrk-yti/yti-common-ui';

function addToControl<T>(control: FormControl, item: T) {

  control.setValue(item);
}

function removeFromControl<T>(control: FormControl) {

  control.setValue(null);
}

@Component({
  selector: 'app-code-input',
  template: `
    <dl *ngIf="editing || code">
      <dt>
        <label>{{label}}</label>
        <app-information-symbol [infoText]="infoText"></app-information-symbol>
        <app-required-symbol *ngIf="required && editing"></app-required-symbol>
      </dt>
      <dd>
        <div *ngIf="!editing && code">
          <span *ngIf="!showDetailLabel">{{code.getLongDisplayName(languageService, false)}}</span>
          <span *ngIf="showDetailLabel">{{code.getDisplayNameWithCodeSchemeAndRegistry(languageService, false)}}</span>
        </div>
        <div *ngIf="editing && code">
          <a class="removal-X">
            <i id="remove_code_link"
               class="fa fa-times"
               (click)="removeCode(code)"></i>
          </a>
          <span *ngIf="!showDetailLabel">{{code.getLongDisplayName(languageService, false)}}</span>
          <span *ngIf="showDetailLabel">{{code.getDisplayNameWithCodeSchemeAndRegistry(languageService, false)}}</span>
        </div>

        <app-error-messages id="code_error_messages" [control]="parentControl"></app-error-messages>

        <button *ngIf="editing"
                id="add_code_button"
                type="button"
                class="btn btn-sm btn-action mt-2"
                (click)="selectCode()" translate>Select code</button>
      </dd>
    </dl>
  `
})
export class CodeInputComponent implements ControlValueAccessor {

  @Input() label: string;
  @Input() codeSchemes: CodeScheme[];
  @Input() required = false;
  @Input() infoText: string;
  @Input() showDetailLabel: boolean;
  @Input() restricts: string[] = [];
  control = new FormControl(null);

  private propagateChange: (fn: any) => void = () => {};
  private propagateTouched: (fn: any) => void = () => {};

  constructor(@Self() @Optional() public parentControl: NgControl,
              private editableService: EditableService,
              private translateService: TranslateService,
              private dataService: DataService,
              private searchLinkedCodeModalService: SearchLinkedCodeModalService,
              public languageService: LanguageService) {

    this.control.valueChanges.subscribe(x => this.propagateChange(x));

    if (parentControl) {
      parentControl.valueAccessor = this;
    }
  }

  get code() {
    return this.control.value as Code;
  }

  selectCode() {
    const titleLabel = this.translateService.instant('Select code');
    const searchlabel = this.translateService.instant('Search code');

    this.searchLinkedCodeModalService.openWithCodeSchemes(this.codeSchemes, titleLabel, searchlabel, this.restricts, false)
      .then(code => addToControl(this.control, code), ignoreModalClose);
  }

  removeCode() {
    removeFromControl(this.control);
  }

  get editing() {
    return this.editableService.editing;
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
