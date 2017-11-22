import { Component, Injectable, Input } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ExternalReference } from '../../entities/external-reference';
import { EditableService } from '../../services/editable.service';
import { FormControl, FormGroup } from '@angular/forms';
import { PropertyType } from '../../entities/property-type';
import { DataService } from '../../services/data.service';

@Injectable()
export class LinkEditModalService {

  constructor(private modalService: NgbModal) {
  }

  public open(externalReference: ExternalReference): Promise<ExternalReference> {
    const modalRef = this.modalService.open(LinkEditModalComponent, {size: 'sm'});
    const instance = modalRef.componentInstance as LinkEditModalComponent;
    console.log('Url: ' + externalReference.url);
    instance.link = externalReference;
    return modalRef.result;
  }
}

@Component({
  selector: 'app-link-edit-modal',
  templateUrl: './link-edit-modal.component.html',
  providers: [EditableService]
})
export class LinkEditModalComponent {

  @Input() link: ExternalReference;

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

      this.editableService.edit();
      this.initialized = true;
    });

    this.linkForm.reset(this.link);
  }

  get initializing(): boolean {
    return this.propertyTypes == null && this.initialized;
  }

  close() {
    this.modal.dismiss('cancel');
  }

  save() {
    this.link.propertyType = this.propertyType;
    this.modal.close(Object.assign({}, this.link, this.linkForm.value));
  }
}
