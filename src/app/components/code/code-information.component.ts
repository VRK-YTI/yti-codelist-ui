import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { Code } from '../../entities/code';
import { FormControl, FormGroup } from '@angular/forms';
import { EditableService } from '../../services/editable.service';
import { Subscription } from 'rxjs/Subscription';
import { PropertyType } from '../../entities/property-type';
import { ExternalReference } from '../../entities/external-reference';
import { LinkEditModalService } from '../codescheme/link-edit-modal.component';
import { LinkShowModalService } from '../codescheme/link-show-modal.component';
import { LinkListModalService } from '../codescheme/link-list-modal.component';
import { CodeListConfirmationModalService } from '../common/confirmation-modal.service';
import { remove } from 'yti-common-ui/utils/array';
import { ignoreModalClose } from 'yti-common-ui/utils/modal';
import { selectableStatuses, restrictedStatuses, Status } from 'yti-common-ui/entities/status';
import { toPickerDate } from '../../utils/date';

@Component({
  selector: 'app-code-information',
  templateUrl: './code-information.component.html',
  styleUrls: ['./code-information.component.scss']
})
export class CodeInformationComponent implements OnChanges, OnDestroy {

  @Input() code: Code;
  @Input() currentStatus: string;

  cancelSubscription: Subscription;

  codeForm = new FormGroup({
    prefLabel: new FormControl(''),
    description: new FormControl(''),
    shortName: new FormControl(''),
    externalReferences: new FormControl(),
    startDate: new FormControl(),
    endDate: new FormControl()
  });

  constructor(private linkEditModalService: LinkEditModalService,
              private linkShowModalService: LinkShowModalService,
              private linkListModalService: LinkListModalService,
              private editableService: EditableService,
              private confirmationModalService: CodeListConfirmationModalService) {
    this.cancelSubscription = editableService.cancel$.subscribe(() => this.reset());
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.reset();
  }

  reset() {
    const { externalReferences, ...rest } = this.code;
    
    this.codeForm.reset(Object.assign({}, rest, {
      externalReferences: this.code.externalReferences.map(link => link.clone()),
      startDate: toPickerDate(this.code.startDate),
      endDate: toPickerDate(this.code.endDate),
      prefLabel: this.code.prefLabel,
      description: this.code.description,
      shortName: this.code.shortName
    }));
  }

  get statuses(): string[] {
    return this.restrictedCurrentStatus ? restrictedStatuses : selectableStatuses;
  }

  get restrictedCurrentStatus(): boolean {
    return restrictedStatuses.includes(this.currentStatus as Status);
  }

  get editing() {
    return this.editableService.editing;
  }

  get editingWhenNotRestricted() {
    return this.editableService.editing && !this.editableService.restrictedEditing;
  }

  ngOnDestroy() {
    this.cancelSubscription.unsubscribe();
  }

  get externalReferences(): ExternalReference[] {
    return this.codeForm.value.externalReferences;
  }

  getUsedPropertyTypes(): PropertyType[] {

    const propertyTypes: PropertyType[] = [];
    for (const externalReference of this.codeForm.value.externalReferences) {
      if (propertyTypes.findIndex(propertyType => propertyType.localName === externalReference.propertyType.localName) === -1) {
        propertyTypes.push(externalReference.propertyType);
      }
    }
    return propertyTypes;
  }

  getExternalReferencesByLocalName(localName: string): ExternalReference[] {
    return this.codeForm.value.externalReferences.filter((externalReference: ExternalReference) =>
      externalReference.propertyType.localName === localName);
  }

  addLink() {

    const restrictIds = this.externalReferences.map(link => link.id);

    this.linkListModalService.open(this.code.codeScheme.id, restrictIds)
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

}
