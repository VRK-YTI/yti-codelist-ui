import { Component, Input, Optional, Self, OnInit, OnDestroy } from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl } from '@angular/forms';
import { ExternalReference, groupByType, PropertyTypeExternalReferences } from '../../entities/external-reference';
import { EditableService } from '../../services/editable.service';
import { CodeListConfirmationModalService } from '../common/confirmation-modal.service';
import { LinkEditModalService } from '../codescheme/link-edit-modal.component';
import { LinkShowModalService } from '../codescheme/link-show-modal.component';
import { LinkListModalService } from '../codescheme/link-list-modal.component';
import { LanguageService } from '../../services/language.service';
import { CodePlain } from '../../entities/code-simple';
import { DataService } from '../../services/data.service';
import { PropertyType } from '../../entities/property-type';
import { LinkCreateModalService } from '../codescheme/link-create-modal.component';
import { Subscription } from 'rxjs';
import { CodeScheme } from '../../entities/code-scheme';
import { ignoreModalClose, remove } from '@vrk-yti/yti-common-ui';

@Component({
  selector: 'app-external-references-input',
  styleUrls: ['./external-references-input.component.scss'],
  template: `
    <dl *ngIf="editing || externalReferences.length > 0">
      <dt>
        <label>{{label}}</label>
        <app-information-symbol [infoText]="infoText"></app-information-symbol>
        <app-required-symbol *ngIf="required && editing"></app-required-symbol>
      </dt>
      <dd>
        <div *ngFor="let propertyExternalReferences of externalReferencesByType">

          <label>{{propertyExternalReferences.label | translateValue}}</label>

          <div *ngFor="let externalReference of propertyExternalReferences.externalReferences" class="row">

            <div class="col-10">
              <button [id]="'show_' + externalReference.getIdIdentifier(languageService) + '_ref_button'"
                      type="button" class="btn btn-link link" (click)="showExternalReference(externalReference)">
                <span>{{externalReference.getDisplayName(languageService, false)}}</span>
              </button>
            </div>

            <div *ngIf="editing && !restrict" class="col-2">
              <button [id]="'edit_' + externalReference.getIdIdentifier(languageService) + '_ref_button'"
                      *ngIf="externalReference.global == false"
                      type="button"
                      class="icon icon-pencil"
                      (click)="editExternalReference(externalReference)"></button>
              <button [id]="'remove_' + externalReference.getIdIdentifier(languageService) + '_ref_button'"
                      type="button"
                      class="icon icon-trash"
                      (click)="removeExternalReference(externalReference)"></button>
            </div>
          </div>
        </div>

        <div *ngIf="loading">
          <app-ajax-loading-indicator></app-ajax-loading-indicator>
        </div>

        <div *ngIf="editing && !restrict && !loading">
          <div ngbDropdown class="d-inline-block" placement='top-left'>
            <button class="btn btn-action" id="add_link_propertytype_dropdown" ngbDropdownToggle translate>Add link</button>
            <div ngbDropdownMenu aria-labelledby="add_link_propertytype_dropdown">
              <button *ngFor="let propertyTypeOption of propertyTypes"
                      [id]="propertyTypeOption.idIdentifier + '_propertytype_dropdown_button'"
                      (click)="addLink(propertyTypeOption)"
                      class="dropdown-item">
              {{propertyTypeOption.prefLabel | translateValue:true}}</button>
            </div>
          </div>
        </div>

        <app-error-messages id="external_references_error_messages" [control]="parentControl"></app-error-messages>
      </dd>
    </dl>
  `
})
export class ExternalReferencesInputComponent implements ControlValueAccessor, OnInit, OnDestroy {

  @Input() label: string;
  @Input() codeScheme: CodeScheme;
  @Input() infoText: string;
  @Input() restrict = false;
  @Input() required = false;
  @Input() languageCodes: CodePlain[];
  control = new FormControl([]);
  propertyTypes: PropertyType[];

  loading = false;

  private subscriptionToClean: Subscription[] = [];

  private propagateChange: (fn: any) => void = () => {};
  private propagateTouched: (fn: any) => void = () => {};

  constructor(@Self() @Optional() public parentControl: NgControl,
              private editableService: EditableService,
              public languageService: LanguageService,
              private confirmationModalService: CodeListConfirmationModalService,
              private linkEditModalService: LinkEditModalService,
              private linkShowModalService: LinkShowModalService,
              private linkListModalService: LinkListModalService,
              private linkCreateModalService: LinkCreateModalService,
              private dataService: DataService) {

    this.control.valueChanges.subscribe(x => this.propagateChange(x));

    if (parentControl) {
      parentControl.valueAccessor = this;
    }
  }

  ngOnInit() {

    this.subscriptionToClean.push(this.languageService.language$.subscribe(language => {
      this.dataService.getPropertyTypes('ExternalReference', language).subscribe(types => {

        if (types.length === 0) {
          throw new Error('No types');
        }

        this.propertyTypes = types;
      });
    }));
  }

  get externalReferences(): ExternalReference[] {
    return this.control.value;
  }

  get externalReferencesByType(): PropertyTypeExternalReferences[] {
    return groupByType(this.externalReferences, this.languageService);
  }

  addLink(propertyType: PropertyType) {

    this.loading = true;

    this.dataService.getExternalReferences(this.codeScheme ? this.codeScheme.id : undefined).subscribe(extReferences => {

      const restrictIds = this.externalReferences.map(link => link.id);
      const otherExternalReferences = extReferences.filter(externalReference => restrictIds.indexOf(externalReference.id) === -1);
      const externalReferencesOfThisType = otherExternalReferences.filter(extRef => extRef.propertyType!.id === propertyType.id);
      const externalReferencesOfThisTypeFound = externalReferencesOfThisType.length > 0;

      this.loading = false;

      if (externalReferencesOfThisTypeFound) {
        this.linkListModalService.open(this.codeScheme, otherExternalReferences, this.languageCodes, propertyType, this.propertyTypes)
          .then(link => this.externalReferences.push(link), ignoreModalClose);
      } else {
        this.linkCreateModalService.open(this.codeScheme, this.languageCodes, propertyType)
          .then(link => {
            this.externalReferences.push(link);
          }, ignoreModalClose);
      }
    });
  }

  editExternalReference(externalReference: ExternalReference) {
    this.linkEditModalService.open(externalReference, this.languageCodes);
  }

  showExternalReference(externalReference: ExternalReference) {
    this.linkShowModalService.open(externalReference, this.languageCodes);
  }

  removeExternalReference(externalReference: ExternalReference) {

    this.confirmationModalService.openRemoveLink()
      .then(() => {
        remove(this.externalReferences, externalReference);
      }, ignoreModalClose);
  }

  get valid() {
    return !this.parentControl || this.parentControl.valid;
  }

  get show() {
    return this.editing || this.control.value;
  }

  get editing() {
    return this.editableService.editing && !this.restrict;
  }

  ngOnDestroy(): void {
    this.subscriptionToClean.forEach(s => s.unsubscribe());
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
