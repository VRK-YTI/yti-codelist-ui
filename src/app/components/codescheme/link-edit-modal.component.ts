import { Component, Injectable, Input } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ExternalReference } from '../../entities/external-reference';
import { EditableService } from '../../services/editable.service';
import { PropertyType } from '../../entities/property-type';
import { DataService } from '../../services/data.service';
import { FormControl, FormGroup } from '@angular/forms';

@Injectable()
export class LinkEditModalService {

  constructor(private modalService: NgbModal) {
  }

  public open(externalReference: ExternalReference): void {
    const modalRef = this.modalService.open(LinkEditModalComponent, {size: 'sm'});
    const instance = modalRef.componentInstance as LinkEditModalComponent;
    console.log('Url: ' + externalReference.url);
    instance.link = externalReference;
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

  linkForm = new FormGroup({
    titles: new FormControl({}),
    descriptions: new FormControl({}),
    url: new FormControl('')
  });

  propertyType: PropertyType;

  constructor(private dataService: DataService,
              private editableService: EditableService,
              private modal: NgbActiveModal) {

    this.editableService.edit();
    this.linkForm.reset(this.link);
    this.propertyType = this.link.propertyType;

    this.dataService.getPropertyTypes('ExternalReference').subscribe(types => {

      if (types.length === 0) {
        throw new Error('No types');
      }

      this.propertyTypes = types;
      this.initialized = true;
    });
  }

  get initializing(): boolean {
    return !this.propertyTypes;
  }

  close() {
    this.modal.dismiss('cancel');
  }

  save() {
    Object.assign(this.link, this.linkForm.value);
    this.link.propertyType = this.propertyType;
    this.modal.close();
  }
}
