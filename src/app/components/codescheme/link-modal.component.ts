import { Component, Injectable, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ExternalReference } from '../../entities/external-reference';
import { EditableService, EditingComponent } from '../../services/editable.service';
import { FormControl, FormGroup } from '@angular/forms';
import { PropertyType } from '../../entities/property-type';
import { DataService } from '../../services/data.service';
import { LinkListModalComponent } from './link-list-modal.component';

@Injectable()
export class LinkModalService {

  constructor(private modalService: NgbModal) {
  }

  public openList(externalReferences: ExternalReference[]): Promise<ExternalReference> {
    const modalRef = this.modalService.open(LinkListModalComponent, {size: 'sm'});
    const instance = modalRef.componentInstance as LinkListModalComponent;
    instance.externalReferences = externalReferences;
    return modalRef.result;
  }

  public openWithShow(externalReference: ExternalReference): Promise<ExternalReference> {
    const modalRef = this.modalService.open(LinkModalComponent, {size: 'sm'});
    const instance = modalRef.componentInstance as LinkModalComponent;
    instance.link = externalReference;
    instance.enableEdit = false;
    instance.isCreating = false;
    return modalRef.result;
  }

  public openWithCreate(): Promise<ExternalReference> {
    const modalRef = this.modalService.open(LinkModalComponent, {size: 'sm'});
    const instance = modalRef.componentInstance as LinkModalComponent;
    const link: ExternalReference = new ExternalReference();
    link.titles = {};
    link.descriptions = {};
    instance.link = link;
    instance.isCreating = true;
    instance.enableEdit = true;
    return modalRef.result;
  }

  public openWithModify(externalReference: ExternalReference): Promise<ExternalReference> {
    const modalRef = this.modalService.open(LinkModalComponent, {size: 'sm'});
    const instance = modalRef.componentInstance as LinkModalComponent;
    console.log('Url: ' + externalReference.url);
    instance.link = externalReference;
    instance.enableEdit = true;
    instance.isCreating = false;
    return modalRef.result;
  }
}


@Component({
  selector: 'app-link-modal',
  templateUrl: './link-modal.component.html',
  providers: [EditableService]
})
export class LinkModalComponent implements EditingComponent, OnChanges, OnInit {

  @Input() link: ExternalReference;
  @Input() isCreating: boolean;
  @Input() enableEdit: boolean;
  initialized: boolean;
  propertyTypes: PropertyType[];
  propertyType: PropertyType;

  linkForm = new FormGroup({
    titles: new FormControl({}),
    descriptions: new FormControl({}),
    url: new FormControl('')
  });

  constructor(private dataService: DataService,
              private editableService: EditableService,
              private modal: NgbActiveModal) {
  }

  ngOnInit() {
    this.dataService.getPropertyTypes('ExternalReference').subscribe(types => {
      this.propertyTypes = types;
      if (this.link.propertyType !== undefined) {
        this.propertyType = this.link.propertyType;
      } else if (this.propertyTypes !== undefined && this.propertyTypes.length > 0) {
        this.propertyType = this.propertyTypes[0];
        this.link.propertyType = this.propertyType;
      } else {
        console.log('Issue with PropertyType not being set!');
      }
      this.linkForm.reset(this.link);
      if (this.enableEdit) {
        this.editableService.edit();
      }
      this.initialized = true;
    });
  }

  get initializing(): boolean {
    return this.propertyTypes == null && this.initialized;
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.linkForm.reset(this.link);
  }

  isEditing(): boolean {
    return this.editableService.editing;
  }

  cancelEditing(): void {
    this.editableService.cancel();
  }

  close() {
    this.modal.dismiss('cancel');
  }

  add() {
    this.link.propertyType = this.propertyType;
    this.modal.close(Object.assign({}, this.link, this.linkForm.value));
  }

  save() {
    this.link.propertyType = this.propertyType;
    this.modal.close(Object.assign({}, this.link, this.linkForm.value));
  }
}
