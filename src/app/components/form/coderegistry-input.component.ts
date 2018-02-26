import { Component, Input, Optional, Self, OnInit, Output, EventEmitter } from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl } from '@angular/forms';
import { EditableService } from '../../services/editable.service';
import { CodeRegistry } from '../../entities/code-registry';
import { DataService } from '../../services/data.service';
import { Options } from 'yti-common-ui/components/dropdown.component';
import { TranslateService } from 'ng2-translate';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-coderegistry-input',
  template: `
    <dl *ngIf="show">
      <dt>
        <label translate>Coderegistry</label>
      </dt>
      <dd>
        <div ngbDropdown class="d-inline-block">
          <app-dropdown [options]="codeRegistryOptions" [formControl]="control"></app-dropdown>
          <app-error-messages [control]="parentControl"></app-error-messages>
        </div>
      </dd>
    </dl>
  `
})
export class CodeRegistryInputComponent implements ControlValueAccessor, OnInit {

  @Output() loaded = new EventEmitter();
  control = new FormControl();
  
  codeRegistries: CodeRegistry[];
  codeRegistryOptions: Options<CodeRegistry>; 

  private propagateChange: (fn: any) => void = () => {};
  private propagateTouched: (fn: any) => void = () => {};

  constructor(@Self() @Optional() public parentControl: NgControl,
              private editableService: EditableService,
              private dataService: DataService,
              private translateService: TranslateService,
              private languageService: LanguageService) {

    this.control.valueChanges.subscribe(x => this.propagateChange(x));
    
    if (parentControl) {
      parentControl.valueAccessor = this;
    }
  }

  ngOnInit() {    
    this.dataService.getCodeRegistriesForUser().subscribe(codeRegistries => {
      this.codeRegistries = codeRegistries;

      this.codeRegistryOptions = [
        { value: null, name: () => this.translateService.instant('No registry') },
        ...codeRegistries.map(reg => ({ value: reg, name: () => this.languageService.translate(reg.prefLabel, true)}))
      ];

      this.loaded.emit();
    });
  }

  get show() {
    return this.editing || this.control.value;
  }

  get editing() {
    return this.editableService.editing;
  }

  get options(): CodeRegistry[] {
    return this.codeRegistries;
  }

  writeValue(obj: any): void {

    if (obj != null && !(obj instanceof CodeRegistry)) {
      throw new Error('Not an CodeRegistry');
    }

    this.control.setValue(obj);
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.propagateTouched = fn;
  }
}
