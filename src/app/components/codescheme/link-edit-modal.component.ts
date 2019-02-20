import { Component, Injectable, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ExternalReference } from '../../entities/external-reference';
import { EditableService } from '../../services/editable.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalService } from '../../services/modal.service';
import { CodePlain } from '../../entities/code-simple';

@Component({
  selector: 'app-link-edit-modal',
  templateUrl: './link-edit-modal.component.html',
  providers: [EditableService]
})
export class LinkEditModalComponent implements OnInit {

  @Input() link: ExternalReference;
  @Input() languageCodes: CodePlain[];

  linkForm = new FormGroup({
    title: new FormControl({}),
    description: new FormControl({}),
    href: new FormControl('', Validators.required),
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

@Injectable()
export class LinkEditModalService {

  constructor(private modalService: ModalService) {
  }

  public open(externalReference: ExternalReference, languageCodes: CodePlain[]): void {
    const modalRef = this.modalService.open(LinkEditModalComponent, { size: 'sm', backdrop: 'static', keyboard: false });
    const instance = modalRef.componentInstance as LinkEditModalComponent;
    instance.link = externalReference;
    instance.languageCodes = languageCodes;
  }
}
