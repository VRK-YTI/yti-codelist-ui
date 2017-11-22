import { Component, Injectable } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ExternalReference } from '../../entities/external-reference';
import { EditableService } from '../../services/editable.service';
import { PropertyType } from '../../entities/property-type';
import { DataService } from '../../services/data.service';

@Injectable()
export class LinkCreateModalService {

  constructor(private modalService: NgbModal) {
  }

  public open(): Promise<ExternalReference> {
    const modalRef = this.modalService.open(LinkCreateModalComponent, {size: 'sm'});
    return modalRef.result;
  }
}

@Component({
  selector: 'app-link-create-modal',
  templateUrl: './link-create-modal.component.html',
  providers: [EditableService]
})
export class LinkCreateModalComponent {

  link = new ExternalReference();
  propertyTypes: PropertyType[];

  constructor(private dataService: DataService,
              private editableService: EditableService,
              private modal: NgbActiveModal) {

    this.editableService.edit();

    this.dataService.getPropertyTypes('ExternalReference').subscribe(types => {

      if (types.length === 0) {
        throw new Error('No types');
      }

      this.propertyTypes = types;
      this.link.propertyType = types[0];
    });
  }

  get initializing(): boolean {
    return !this.propertyTypes;
  }

  close() {
    this.modal.dismiss('cancel');
  }

  add() {
    this.modal.close(this.link);
  }
}
