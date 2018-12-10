import { Component, Input, Optional, Self } from '@angular/core';
import { EditableService } from '../../services/editable.service';
import { ControlValueAccessor, FormControl, NgControl } from '@angular/forms';
import { ignoreModalClose } from 'yti-common-ui/utils/modal';
import { comparingLocalizable } from 'yti-common-ui/utils/comparator';
import { DataService } from '../../services/data.service';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Organization } from '../../entities/organization';
import { SearchLinkedOrganizationModalService } from './search-linked-organization-modal.component';
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
  selector: 'app-organizations-input',
  template: `
    <dl *ngIf="editing || selectableOrganizations.length > 0">
      <dt>
        <label>{{label}}</label>
        <app-information-symbol [infoText]="infoText"></app-information-symbol>
        <app-required-symbol *ngIf="required && editing"></app-required-symbol>
      </dt>
      <dd>
        <div *ngIf="!editing">
          <div *ngFor="let organization of selectableOrganizations">
            <span>{{organization.prefLabel | translateValue:true}}</span>
          </div>
        </div>
        <div *ngIf="editing">
          <div *ngFor="let organization of selectableOrganizations">
            <a class="removal-X">
              <i [id]="'remove_' + organization.getIdIdentifier(languageService) + '_organization_link'"
                 class="fa fa-times"
                 (click)="removeOrganization(organization)"></i>
            </a>
            <span>{{organization.getDisplayName(languageService, true)}}</span>
          </div>
          <app-error-messages id="organization_error_messages" [control]="parentControl"></app-error-messages>
        </div>

        <button id="add_organization_button"
                type="button"
                class="btn btn-sm btn-action mt-2"
                *ngIf="editing"
                (click)="addOrganization()" translate>Add organization</button>
      </dd>
    </dl>
  `
})
export class OrganizationsInputComponent implements ControlValueAccessor {

  @Input() label: string;
  @Input() restrict = false;
  @Input() required = false;
  @Input() infoText: string;
  control = new FormControl([]);

  organizations$: Observable<Organization[]>;

  private propagateChange: (fn: any) => void = () => {};
  private propagateTouched: (fn: any) => void = () => {};

  constructor(@Self() @Optional() public parentControl: NgControl,
              private editableService: EditableService,
              private translateService: TranslateService,
              private dataService: DataService,
              private searchLinkedOrganizationModalService: SearchLinkedOrganizationModalService,
              public languageService: LanguageService) {

    this.control.valueChanges.subscribe(x => this.propagateChange(x));

    if (parentControl) {
      parentControl.valueAccessor = this;
    }

    this.organizations$ = this.dataService.getOrganizations();
  }

  get selectableOrganizations(): Organization[] {
    return (this.control.value as Organization[]).sort(comparingLocalizable<Organization>(this.languageService, organization => organization.prefLabel ? organization.prefLabel : {}));
  }

  addOrganization() {
    const titleLabel = this.translateService.instant('Choose organization');
    const searchlabel = this.translateService.instant('Search organization');
    const restrictIds = this.selectableOrganizations.map(organization => organization.id);

    this.searchLinkedOrganizationModalService.open(this.organizations, titleLabel, searchlabel, restrictIds, true)
      .then(organization => addToControl(this.control, organization), ignoreModalClose);
  }

  removeOrganization(organization: Organization) {
    removeFromControl(this.control, organization);
  }

  get organizations() {
    return this.organizations$;
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
