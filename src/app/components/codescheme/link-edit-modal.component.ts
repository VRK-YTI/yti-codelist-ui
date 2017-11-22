import { Component, Injectable, Input, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ExternalReference } from '../../entities/external-reference';
import { EditableService } from '../../services/editable.service';
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
export class LinkEditModalComponent implements OnInit {

  @Input() link: ExternalReference;

  linkForm = new FormGroup({
    titles: new FormControl({}),
    descriptions: new FormControl({}),
    url: new FormControl(''),
    propertyType: new FormControl()
  });

  constructor(private editableService: EditableService,
              private modal: NgbActiveModal) {

    this.editableService.edit();
  }

  ngOnInit() {
    this.linkForm.reset(this.link);
    // TODO doesn't feel right,but without assigning actual clone value in plain object without PropertyType prototype
    this.linkForm.patchValue({
      propertyType: this.link.propertyType.clone()
    });
  }

  close() {
    this.modal.dismiss('cancel');
  }

  save() {
    Object.assign(this.link, this.linkForm.value);
    this.modal.close();
  }
}
