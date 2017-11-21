import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Injectable } from '@angular/core';
import { ExternalReference } from '../../entities/external-reference';
import { LinkListModalComponent } from './link-list-modal.component';
import { LinkModalComponent } from './link-modal.component';

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

