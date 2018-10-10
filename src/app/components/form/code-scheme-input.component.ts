import { Component, Input, Optional, Self } from '@angular/core';
import { EditableService } from '../../services/editable.service';
import { ControlValueAccessor, FormControl, NgControl } from '@angular/forms';
import { ignoreModalClose } from 'yti-common-ui/utils/modal';
import { DataService } from '../../services/data.service';
import { TranslateService } from '@ngx-translate/core';
import { CodeScheme } from '../../entities/code-scheme';
import { LanguageService } from '../../services/language.service';
import { SearchLinkedCodeSchemeModalService } from './search-linked-code-scheme-modal.component';
import { comparingLocalizable } from 'yti-common-ui/utils/comparator';

function addToControl<T>(control: FormControl, itemToAdd: T) {

  const previous = control.value as T[];
  control.setValue([...previous, itemToAdd]);
}

function removeFromControl<T>(control: FormControl, itemToRemove: T) {

  const previous = control.value as T[];
  control.setValue(previous.filter(item => item !== itemToRemove));
}

@Component({
  selector: 'app-code-scheme-input',
  template: `
    <dl *ngIf="editing || codeSchemes.length > 0">
      <dt>
        <label>{{label}}</label>
        <app-information-symbol [infoText]="'INFO_TEXT_INFODOMAIN'"></app-information-symbol>
        <app-required-symbol *ngIf="required && editing"></app-required-symbol>
      </dt>
      <dd>
        <div *ngIf="!editing">
          <div *ngFor="let codeScheme of codeSchemes">
            <span>{{codeScheme.getLongDisplayName(languageService, false)}}</span>
          </div>
        </div>
        <div *ngIf="editing">
          <div *ngFor="let codeScheme of codeSchemes">
            <a class="removal-X">
              <i [id]="'remove_' + codeScheme.codeValue + '_code_scheme_link'"
                 class="fa fa-times"
                 (click)="removeCodeScheme(codeScheme)"></i>
            </a>
            <span>{{codeScheme.getLongDisplayName(languageService, false)}}</span>
          </div>
          <app-error-messages id="codeschemes_error_messages" [control]="parentControl"></app-error-messages>
        </div>

        <button id="add_codelist_button"
                type="button"
                class="btn btn-sm btn-action mt-2"
                *ngIf="editing"
                (click)="addCodeScheme()" translate>Add code list</button>
      </dd>
    </dl>
  `
})
export class CodeSchemeInputComponent implements ControlValueAccessor {

  @Input() label: string;
  @Input() required = false;
  @Input() infoText: string;
  @Input() parentCodeScheme: CodeScheme;
  control = new FormControl([]);

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

  get codeSchemes(): CodeScheme[] {
    return (this.control.value as CodeScheme[]).sort(comparingLocalizable<CodeScheme>(
      this.languageService, (codeScheme: CodeScheme) => codeScheme.prefLabel));

  }

  addCodeScheme() {
    const titleLabel = this.translateService.instant('Choose code list');
    const searchlabel = this.translateService.instant('Search code list');
    const restrictIds = this.codeSchemes.map(codeScheme => codeScheme.id);
    if (this.parentCodeScheme) {
      restrictIds.push(this.parentCodeScheme.id);
    }
    this.searchLinkedCodeSchemeModalService.open(titleLabel, searchlabel, restrictIds, true)
      .then((codeScheme: CodeScheme) => addToControl(this.control, codeScheme), ignoreModalClose);
  }

  removeCodeScheme(codeScheme: CodeScheme) {
    removeFromControl(this.control, codeScheme);
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
