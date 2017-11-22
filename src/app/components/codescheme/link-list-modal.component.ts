import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Component, Injectable, Input, OnInit } from '@angular/core';
import { EditableService } from '../../services/editable.service';
import { ExternalReference } from '../../entities/external-reference';
import { DataService } from '../../services/data.service';
import { LinkCreateModalService } from './link-create-modal.component';
import { ignoreModalClose } from '../../utils/modal';

@Injectable()
export class LinkListModalService {

  constructor(private modalService: NgbModal) {
  }

  public open(codeSchemeId: string, restrictExternalReferenceIds: string[]): Promise<ExternalReference> {
    const modalRef = this.modalService.open(LinkListModalComponent, {size: 'sm'});
    const instance = modalRef.componentInstance as LinkListModalComponent;
    instance.codeSchemeId = codeSchemeId;
    instance.restrictExternalReferenceIds = restrictExternalReferenceIds;
    return modalRef.result;
  }
}

@Component({
  selector: 'app-link-list-modal',
  templateUrl: './link-list-modal.component.html',
  providers: [EditableService]
})
export class LinkListModalComponent implements OnInit {

  @Input() codeSchemeId: string;
  @Input() restrictExternalReferenceIds: string[];

  externalReferences: ExternalReference[] = [];
  selectedExternalReference: ExternalReference;

  constructor(private modal: NgbActiveModal,
              private dataService: DataService,
              private linkCreateModalService: LinkCreateModalService) {
  }

  ngOnInit() {
    this.dataService.getExternalReferences(this.codeSchemeId).subscribe(externalReferences => {
      this.externalReferences = externalReferences.filter(link => this.restrictExternalReferenceIds.indexOf(link.id) !== -1);
    });
  }

  close() {
    this.modal.dismiss('cancel');
  }

  select() {
    console.log('Selected value: ' + this.selectedExternalReference.url);
    this.modal.close(this.selectedExternalReference);
  }

  create() {
    this.linkCreateModalService.open()
      .then(link => this.modal.close(link), ignoreModalClose);
  }

  canSelect() {
    return this.selectedExternalReference != null;
  }
}
