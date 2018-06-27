import { Component, Input, Optional, Self } from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl } from '@angular/forms';
import { ignoreModalClose } from 'yti-common-ui/utils/modal';
import { ExternalReference, groupByType, PropertyTypeExternalReferences } from '../../entities/external-reference';
import { remove } from 'yti-common-ui/utils/array';
import { EditableService } from '../../services/editable.service';
import { CodeListConfirmationModalService } from '../common/confirmation-modal.service';
import { LinkEditModalService } from '../codescheme/link-edit-modal.component';
import { LinkShowModalService } from '../codescheme/link-show-modal.component';
import { LinkListModalService } from '../codescheme/link-list-modal.component';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-external-references-input',
  styleUrls: ['./external-references-input.component.scss'],
  template: `
    <dl *ngIf="editing || externalReferences.length > 0">
      <dt><label>{{label}}</label></dt>
      <dd>
        <div *ngFor="let propertyExternalReferences of externalReferencesByType">

          <label>{{propertyExternalReferences.label | translateValue}}</label>

          <div *ngFor="let externalReference of propertyExternalReferences.externalReferences" class="row">

            <div class="col-10">
              <button [id]="'show_' + externalReference.getIdIdentifier(languageService) + '_ref_button'"
                      type="button" class="btn btn-link link" (click)="showExternalReference(externalReference)">
                <span>{{externalReference.getDisplayName(languageService)}}</span>
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

        <div *ngIf="editing && !restrict">
          <button id="add_link_button" class="btn btn-action" (click)="addLink()" translate>Add link</button>
        </div>

        <app-error-messages id="external_references_error_messages" [control]="parentControl"></app-error-messages>
      </dd>
    </dl>
  `
})
export class ExternalReferencesInputComponent implements ControlValueAccessor {

  @Input() label: string;
  @Input() codeSchemeId: string;
  @Input() restrict = false;
  control = new FormControl([]);

  private propagateChange: (fn: any) => void = () => {};
  private propagateTouched: (fn: any) => void = () => {};

  constructor(@Self() @Optional() public parentControl: NgControl,
              private editableService: EditableService,
              public languageService: LanguageService,
              private confirmationModalService: CodeListConfirmationModalService,
              private linkEditModalService: LinkEditModalService,
              private linkShowModalService: LinkShowModalService,
              private linkListModalService: LinkListModalService) {

    this.control.valueChanges.subscribe(x => this.propagateChange(x));

    if (parentControl) {
      parentControl.valueAccessor = this;
    }
  }

  get externalReferences(): ExternalReference[] {
    return this.control.value;
  }

  get externalReferencesByType(): PropertyTypeExternalReferences[] {
    return groupByType(this.externalReferences);
  }

  addLink() {

    const restrictIds = this.externalReferences.map(link => link.id);

    this.linkListModalService.open(this.codeSchemeId, restrictIds)
      .then(link => this.externalReferences.push(link), ignoreModalClose);
  }

  editExternalReference(externalReference: ExternalReference) {
    this.linkEditModalService.open(externalReference);
  }

  showExternalReference(externalReference: ExternalReference) {
    this.linkShowModalService.open(externalReference);
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
