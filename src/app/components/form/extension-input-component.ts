import { Component, Input, Optional, Self } from '@angular/core';
import { EditableService } from '../../services/editable.service';
import { ControlValueAccessor, FormControl, NgControl } from '@angular/forms';
import { ignoreModalClose } from 'yti-common-ui/utils/modal';
import { SearchLinkedExtensionModalService } from './search-linked-extension-modal.component';
import { DataService } from '../../services/data.service';
import { TranslateService } from 'ng2-translate';
import { ExtensionScheme } from '../../entities/extension-scheme';
import { Extension } from '../../entities/extension';
import { LanguageService } from '../../services/language.service';

function addToControl<T>(control: FormControl, item: T) {

  control.setValue(item);
}

function removeFromControl<T>(control: FormControl) {

  control.setValue(null);
}

@Component({
  selector: 'app-extension-input',
  template: `
    <dl *ngIf="editing || extension">
      <dt>
        <label>{{label}}</label>
      </dt>
      <dd>
        <div *ngIf="!editing && extension">
          <span>{{extension.getDisplayName(languageService, translateService)}}</span>
        </div>
        <div *ngIf="editing && extension">
          <a>
            <i id="{{'remove_extension_link'}}"
               class="fa fa-times"
               (click)="removeExtension(extension)"></i>
          </a>
          <span>{{extension.getDisplayName(languageService, translateService)}}</span>
          <app-error-messages id="extension_error_messages" [control]="parentControl"></app-error-messages>
        </div>

        <button id="add_extension_button"
                type="button"
                class="btn btn-sm btn-action mt-2"
                *ngIf="editing"
                (click)="selectExtension()" translate>Select extension
        </button>
      </dd>
    </dl>
  `
})
export class ExtensionInputComponent implements ControlValueAccessor {

  @Input() label: string;
  @Input() extensionScheme: ExtensionScheme;
  @Input() currentExtension: Extension;
  control = new FormControl(null);

  private propagateChange: (fn: any) => void = () => {};
  private propagateTouched: (fn: any) => void = () => {};

  constructor(@Self() @Optional() public parentControl: NgControl,
              private editableService: EditableService,
              public translateService: TranslateService,
              public languageService: LanguageService,
              private dataService: DataService,
              private searchLinkedExtensionModalService: SearchLinkedExtensionModalService) {

    this.control.valueChanges.subscribe(x => this.propagateChange(x));

    if (parentControl) {
      parentControl.valueAccessor = this;
    }
  }

  get extension() {
    return this.control.value as Extension;
  }

  selectExtension() {
    const titleLabel = this.translateService.instant('Choose extension');
    const searchlabel = this.translateService.instant('Search extension');
    const extensions = this.dataService.getExtensions(
      this.extensionScheme.parentCodeScheme.codeRegistry.codeValue,
      this.extensionScheme.parentCodeScheme.codeValue,
      this.extensionScheme.codeValue);

    this.searchLinkedExtensionModalService.open(
      extensions,
      titleLabel,
      searchlabel,
      [this.currentExtension ? this.currentExtension.id : ''],
      true)
      .then(extension => addToControl(this.control, extension), ignoreModalClose);
  }

  removeExtension() {
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
