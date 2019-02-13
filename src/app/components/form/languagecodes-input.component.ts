import { Component, Input, OnDestroy, Optional, Self } from '@angular/core';
import { Code } from '../../entities/code';
import { EditableService } from '../../services/editable.service';
import { ControlValueAccessor, FormControl, NgControl } from '@angular/forms';
import { ignoreModalClose } from 'yti-common-ui/utils/modal';
import { SearchLinkedCodeModalService } from './search-linked-code-modal.component';
import { comparingLocalizable } from 'yti-common-ui/utils/comparator';
import { DataService } from '../../services/data.service';
import { Observable, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { CodePlain } from '../../entities/code-simple';
import { LanguageService } from '../../services/language.service';

function addToControl<T>(control: FormControl, itemToAdd: T) {

  const previous = control.value as T[];
  control.setValue([...previous, itemToAdd]);
}

function removeFromControl<T>(control: FormControl, itemToRemove: T) {

  const previous = control.value as T[];
  control.setValue(previous.filter(item => item !== itemToRemove));
}

@Component({
  selector: 'app-languagecodes-input',
  template: `
    <dl *ngIf="editing || selectedLanguageCodes.length > 0">
      <dt>
        <label>{{label}}</label>
        <app-information-symbol [infoText]="'INFO_TEXT_LANGUAGE_CODE'"></app-information-symbol>
        <app-required-symbol *ngIf="required && editing"></app-required-symbol>
      </dt>
      <dd>
        <div *ngIf="!editing">
          <div *ngFor="let languageCode of selectedLanguageCodes">
            <span>{{languageCode.prefLabel | translateValue:true}}</span>
          </div>
        </div>
        <div *ngIf="editing && selectedLanguageCodes.length == 1">
          <div *ngFor="let languageCode of selectedLanguageCodes">
            <span>{{languageCode.prefLabel | translateValue:true}}</span>
          </div>
          <app-error-messages id="languagecode_error_messages" [control]="parentControl"></app-error-messages>
        </div>

        <div *ngIf="editing && selectedLanguageCodes.length > 1">
          <div *ngFor="let languageCode of selectedLanguageCodes">
            <a class="removal-X">
              <i [id]="'remove_' + languageCode.codeValue + '_languagecode_link'"
                 class="fa fa-times"
                 (click)="removeLanguageCode(languageCode)"></i>
            </a>
            <span>{{languageCode.prefLabel | translateValue:true}}</span>
          </div>
          <app-error-messages id="languagecode_error_messages" [control]="parentControl"></app-error-messages>
        </div>

        <button id="add_languagecode_button"
                type="button"
                class="btn btn-sm btn-action mt-2"
                *ngIf="editing"
                (click)="addLanguageCode()" translate>Add language code</button>
      </dd>
    </dl>
  `
})
export class LanguageCodesInputComponent implements ControlValueAccessor, OnDestroy {

  @Input() label: string;
  @Input() restrict = false;
  @Input() required = false;
  control = new FormControl([]);

  languageCodes$: Observable<Code[]>;

  private propagateChange: (fn: any) => void = () => {};
  private propagateTouched: (fn: any) => void = () => {};

  private subscriptionsToClean: Subscription[] = [];

  constructor(@Self() @Optional() public parentControl: NgControl,
              private editableService: EditableService,
              private translateService: TranslateService,
              private dataService: DataService,
              public languageService: LanguageService,
              private searchLinkedCodeModalService: SearchLinkedCodeModalService) {

    this.control.valueChanges.subscribe(x => this.propagateChange(x));

    if (parentControl) {
      parentControl.valueAccessor = this;
    }

    this.subscriptionsToClean.push(this.languageService.language$.subscribe((language) => {
      this.languageCodes$ = this.dataService.getLanguageCodes(language);
    }));
  }

  get selectedLanguageCodes(): CodePlain[] {
    return (this.control.value as CodePlain[]).sort(comparingLocalizable<CodePlain>(
      this.languageService, (languageCode: CodePlain) => languageCode.prefLabel));
  }

  addLanguageCode() {
    const titleLabel = this.translateService.instant('Select language code');
    const searchlabel = this.translateService.instant('Search language code');
    const restrictIds = this.selectedLanguageCodes.map(languageCode => languageCode.id);

    this.searchLinkedCodeModalService.openWithCodes(this.languageCodes, titleLabel, searchlabel, restrictIds, true)
      .then((languageCode: Code) =>
        addToControl(this.control, languageCode), ignoreModalClose);
  }

  removeLanguageCode(languageCode: CodePlain) {
    removeFromControl(this.control, languageCode);
  }

  get languageCodes() {
    return this.languageCodes$;
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

  ngOnDestroy(): void {
    this.subscriptionsToClean.forEach(s => s.unsubscribe());
  }
}
