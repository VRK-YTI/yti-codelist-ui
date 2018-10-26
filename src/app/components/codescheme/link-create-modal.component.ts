import { Component, Injectable, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ExternalReference } from '../../entities/external-reference';
import { EditableService } from '../../services/editable.service';
import { ModalService } from '../../services/modal.service';
import { CodePlain } from '../../entities/code-simple';
import { PropertyType } from '../../entities/property-type';

@Component({
  selector: 'app-link-create-modal',
  templateUrl: './link-create-modal.component.html',
  providers: [EditableService]
})
export class LinkCreateModalComponent implements OnInit {

  @Input() languageCodes: CodePlain[];
  @Input() propertyType: PropertyType | null;

  externalReference = new ExternalReference();

  constructor(private editableService: EditableService,
              private modal: NgbActiveModal) {

    this.editableService.edit();
  }

  ngOnInit() {
    if (this.propertyType) {
      this.externalReference.propertyType = this.propertyType;
    }
  }

  close() {
    this.modal.dismiss('cancel');
  }

  add() {
    this.modal.close(this.externalReference);
  }
}

@Injectable()
export class LinkCreateModalService {

  constructor(private modalService: ModalService) {
  }

  public open(languageCodes: CodePlain[], propertyType: PropertyType | null): Promise<ExternalReference> {
    const modalRef = this.modalService.open(LinkCreateModalComponent, {size: 'sm'});
    const instance = modalRef.componentInstance as LinkCreateModalComponent;
    instance.languageCodes = languageCodes;
    instance.propertyType = propertyType;
    return modalRef.result;
  }
}

