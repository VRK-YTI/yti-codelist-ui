import { Component, Injectable, Input, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ExternalReference } from '../../entities/external-reference';
import { EditableService } from '../../services/editable.service';
import { PropertyType } from '../../entities/property-type';
import { DataService } from '../../services/data.service';

@Injectable()
export class LinkShowModalService {

  constructor(private modalService: NgbModal) {
  }

  public open(externalReference: ExternalReference): void {
    const modalRef = this.modalService.open(LinkShowModalComponent, {size: 'sm'});
    const instance = modalRef.componentInstance as LinkShowModalComponent;
    instance.link = externalReference;
  }
}

@Component({
  selector: 'app-link-show-modal',
  templateUrl: './link-show-modal.component.html',
  providers: [EditableService]
})
export class LinkShowModalComponent implements OnInit {

  @Input() link: ExternalReference;

  initialized: boolean;
  propertyTypes: PropertyType[];
  propertyType: PropertyType;

  constructor(private dataService: DataService,
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

      this.initialized = true;
    });
  }

  get initializing(): boolean {
    return this.propertyTypes == null && this.initialized;
  }

  close() {
    this.modal.dismiss('cancel');
  }
}
