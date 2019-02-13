import { Component, Input, Optional, Self } from '@angular/core';
import { EditableService } from '../../services/editable.service';
import { ControlValueAccessor, FormControl, NgControl } from '@angular/forms';
import { ignoreModalClose } from 'yti-common-ui/utils/modal';
import { DataService } from '../../services/data.service';
import { TranslateService } from '@ngx-translate/core';
import { CodeScheme } from '../../entities/code-scheme';
import { LanguageService } from '../../services/language.service';
import { SearchLinkedCodeSchemeModalService } from './search-linked-code-scheme-modal.component';

function addToControl<T>(control: FormControl, item: T) {

  control.setValue(item);
}

function removeFromControl<T>(control: FormControl) {

  control.setValue(null);
}

@Component({
  selector: 'app-code-scheme-single-input',
  template: `
    <dl *ngIf="editing || codeScheme">
      <dt>
        <label>{{label}}</label>
        <app-information-symbol [infoText]="infoText"></app-information-symbol>
        <app-required-symbol *ngIf="required && editing"></app-required-symbol>
      </dt>
      <dd>
        <div *ngIf="!editing">
          <span>{{codeScheme.getLongDisplayName(languageService, false)}}</span>
        </div>
        <div *ngIf="editing">
          <div *ngIf="codeScheme">
            <a class="removal-X">
              <i [id]="'remove_' + codeScheme.codeValue + '_code_scheme_link'"
                 class="fa fa-times"
                 (click)="removeCodeScheme()"></i>
            </a>
            <span>{{codeScheme.getLongDisplayName(languageService, false)}}</span>
          </div>
          <app-error-messages id="codeschemes_error_messages" [control]="parentControl"></app-error-messages>
        </div>

        <button *ngIf="editing"
                id="add_codelist_button"
                type="button"
                class="btn btn-sm btn-action mt-2"
                (click)="selectCodeScheme()" translate>Select code list</button>
      </dd>
    </dl>
  `
})
export class CodeSchemeSingleInputComponent implements ControlValueAccessor {

  @Input() label: string;
  @Input() required = false;
  @Input() infoText: string;
  @Input() restricts: string[];

  control = new FormControl(null);

  private propagateChange: (fn: any) => void = () => {};
  private propagateTouched: (fn: any) => void = () => {};

  constructor(@Self() @Optional() public parentControl: NgControl,
              private editableService: EditableService,
              private translateService: TranslateService,
              private dataService: DataService,
              private searchLinkedCodeSchemeModalService: SearchLinkedCodeSchemeModalService,
              public languageService: LanguageService) {

    this.control.valueChanges.subscribe(x => this.propagateChange(x));

    if (parentControl) {
      parentControl.valueAccessor = this;
    }
  }

  get codeScheme(): CodeScheme {
    return (this.control.value as CodeScheme);
  }

  selectCodeScheme() {
    const titleLabel = this.translateService.instant('Select code list');
    const searchlabel = this.translateService.instant('Search code list');

    this.searchLinkedCodeSchemeModalService.open(titleLabel, searchlabel, this.restricts, false)
      .then((codeScheme: CodeScheme) => addToControl(this.control, codeScheme), ignoreModalClose);
  }

  removeCodeScheme() {
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
