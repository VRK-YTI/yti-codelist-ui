import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { CodeScheme } from '../../entities/code-scheme';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { EditableService } from '../../services/editable.service';
import { ExternalReference } from '../../entities/external-reference';
import { ignoreModalClose } from 'yti-common-ui/utils/modal';
import { LinkListModalService } from './link-list-modal.component';
import { LinkShowModalService } from './link-show-modal.component';
import { LinkEditModalService } from './link-edit-modal.component';
import { remove } from 'yti-common-ui/utils/array';
import { PropertyType } from '../../entities/property-type';
import { CodeListConfirmationModalService } from '../common/confirmation-modal.service';
import { selectableStatuses, restrictedStatuses, Status } from 'yti-common-ui/entities/status';
import { Code } from '../../entities/code';
import { DataService } from '../../services/data.service';
import { toPickerDate } from '../../utils/date';

@Component({
  selector: 'app-code-scheme-information',
  templateUrl: './code-scheme-information.component.html',
  styleUrls: ['./code-scheme-information.component.scss']
})
export class CodeSchemeInformationComponent implements OnChanges, OnDestroy, OnInit {

  @Input() codeScheme: CodeScheme;
  @Input() currentStatus: string;
  dataClassifications: Code[];

  codeSchemeForm = new FormGroup({
    prefLabel: new FormControl({}),
    description: new FormControl({}),
    definition: new FormControl({}),
    source: new FormControl(''),
    legalBase: new FormControl(''),
    governancePolicy: new FormControl(''),
    externalReferences: new FormControl(),
    dataClassifications: new FormControl(),
    startDate: new FormControl(),
    endDate: new FormControl()
  });

  cancelSubscription: Subscription;

  constructor(private linkEditModalService: LinkEditModalService,
              private linkShowModalService: LinkShowModalService,
              private linkListModalService: LinkListModalService,
              private confirmationModalService: CodeListConfirmationModalService,
              private editableService: EditableService,
              private dataService: DataService) {

    this.cancelSubscription = editableService.cancel$.subscribe(() => this.reset());
  }

  ngOnInit() {
    this.dataService.getDataClassificationsAsCodes().subscribe(dataClassifications => {
      this.dataClassifications = dataClassifications;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.reset();
  }

  private reset() {

    const { externalReferences, ...rest } = this.codeScheme;

    this.codeSchemeForm.reset(Object.assign({}, rest, {
      externalReferences: externalReferences.map(link => link.clone()),
      startDate: toPickerDate(this.codeScheme.startDate),
      endDate: toPickerDate(this.codeScheme.endDate)
    }));
  }

  get statuses(): string[] {
    return this.restrictedCurrentStatus ? restrictedStatuses : selectableStatuses;
  }

  get restrictedCurrentStatus(): boolean {
    return restrictedStatuses.includes(this.currentStatus as Status);
  }

  ngOnDestroy() {
    this.cancelSubscription.unsubscribe();
  }

  get editing() {
    return this.editableService.editing;
  }

  get externalReferences(): ExternalReference[] {
    return this.codeSchemeForm.value.externalReferences;
  }

  getUsedPropertyTypes(): PropertyType[] {

    const propertyTypes: PropertyType[] = [];
    for (const externalReference of this.codeSchemeForm.value.externalReferences) {
      if (propertyTypes.findIndex(propertyType => propertyType.localName === externalReference.propertyType.localName) === -1) {
        propertyTypes.push(externalReference.propertyType);
      }
    }
    return propertyTypes;
  }

  getExternalReferencesByLocalName(localName: string): ExternalReference[] {
    return this.codeSchemeForm.value.externalReferences.filter((externalReference: ExternalReference) =>
      externalReference.propertyType.localName === localName);
  }

  addLink() {

    const restrictIds = this.externalReferences.map(link => link.id);

    this.linkListModalService.open(this.codeScheme.id, restrictIds)
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

  setDataClassification(dataClassification: Code) {
    this.codeScheme.dataClassifications = [];
    this.codeScheme.dataClassifications[0] = dataClassification;
  }
}
