import { Component, Injectable, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ExternalReference } from '../../entities/external-reference';
import { EditableService } from '../../services/editable.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalService } from '../../services/modal.service';

@Injectable()
export class LinkEditModalService {

  constructor(private modalService: ModalService) {
  }

  public open(externalReference: ExternalReference): void {
    const modalRef = this.modalService.open(LinkEditModalComponent, {size: 'sm'});
    const instance = modalRef.componentInstance as LinkEditModalComponent;
    console.log('Url: ' + externalReference.referenceUrl);
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
    title: new FormControl({}),
    description: new FormControl({}),
    url: new FormControl('', Validators.required),
    propertyType: new FormControl()
  });

  constructor(private editableService: EditableService,
              private modal: NgbActiveModal) {

    this.editableService.edit();
  }

  ngOnInit() {

    const { propertyType, ...rest } = this.link;

    this.linkForm.reset({
      ...rest,
      propertyType: propertyType ? propertyType.clone() : undefined
    });
  }

  close() {
    this.modal.dismiss('cancel');
  }

  save() {
    Object.assign(this.link, this.linkForm.value);
    this.modal.close();
  }

  canSave() {
    return this.linkForm.valid;
  }
}
