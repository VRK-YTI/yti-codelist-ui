import { Component, Input, OnDestroy, Optional, Self } from '@angular/core';
import { Code } from '../../entities/code';
import { EditableService } from '../../services/editable.service';
import { ControlValueAccessor, FormControl, NgControl } from '@angular/forms';
import { SearchLinkedCodeModalService } from './search-linked-code-modal.component';
import { DataService } from '../../services/data.service';
import { Observable, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { CodePlain } from '../../entities/code-simple';
import { LanguageService } from '../../services/language.service';
import { comparingLocalizable, ignoreModalClose } from '@vrk-yti/yti-common-ui';

function addToControl<T>(control: FormControl, itemToAdd: T) {

  const previous = control.value as T[];
  control.setValue([...previous, itemToAdd]);
}

function removeFromControl<T>(control: FormControl, itemToRemove: T) {

  const previous = control.value as T[];
  control.setValue(previous.filter(item => item !== itemToRemove));
}

@Component({
  selector: 'app-infodomains-input',
  template: `
    <dl *ngIf="editing || infoDomains.length > 0">
      <dt>
        <label>{{label}}</label>
        <app-information-symbol [infoText]="'INFO_TEXT_INFODOMAIN'"></app-information-symbol>
        <app-required-symbol *ngIf="required && editing"></app-required-symbol>
      </dt>
      <dd>
        <div *ngIf="!editing">
          <div *ngFor="let infoDomain of infoDomains">
            <span>{{infoDomain.prefLabel | translateValue:true}}</span>
          </div>
        </div>
        <div *ngIf="editing">
          <div *ngFor="let infoDomain of infoDomains">
            <a class="removal-X">
              <i [id]="'remove_' + infoDomain.codeValue + '_infodomain_link'"
                 class="fa fa-times"
                 (click)="removeInfoDomain(infoDomain)"></i>
            </a>
            <span>{{infoDomain.prefLabel | translateValue:true}}</span>
          </div>
          <app-error-messages id="infodomain_error_messages" [control]="parentControl"></app-error-messages>
        </div>

        <button id="add_infodomain_button"
                type="button"
                class="btn btn-sm btn-action mt-2"
                *ngIf="editing"
                (click)="addInfoDomain()" translate>Add information domain</button>
      </dd>
    </dl>
  `
})
export class InfodomainsInputComponent implements ControlValueAccessor, OnDestroy {

  @Input() label: string;
  @Input() restrict = false;
  @Input() required = false;
  control = new FormControl([]);

  infoDomainsAsCodes$: Observable<Code[]>;

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
      this.infoDomainsAsCodes$ = this.dataService.getInfoDomainsAsCodes(language);
    }));
  }

  get infoDomains(): CodePlain[] {
    return (this.control.value as CodePlain[]).sort(comparingLocalizable<CodePlain>(
      this.languageService, (infoDomain: CodePlain) => infoDomain.prefLabel));
  }

  addInfoDomain() {
    const titleLabel = this.translateService.instant('Select information domain');
    const searchlabel = this.translateService.instant('Search information domain');
    const restrictIds = this.infoDomains.map(infoDomain => infoDomain.id);

    this.searchLinkedCodeModalService.openWithCodes(this.infoDomainsAsObservableCodes, titleLabel, searchlabel, restrictIds, true)
      .then((infoDomain: Code) => addToControl(this.control, infoDomain), ignoreModalClose);
  }

  removeInfoDomain(infoDomain: CodePlain) {
    removeFromControl(this.control, infoDomain);
  }

  get infoDomainsAsObservableCodes() {
    return this.infoDomainsAsCodes$;
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
