import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Component, Injectable, Input, OnInit } from '@angular/core';
import { EditableService } from '../../services/editable.service';
import { ExternalReference, groupByType, PropertyTypeExternalReferences } from '../../entities/external-reference';
import { DataService } from '../../services/data.service';
import { LinkCreateModalService } from './link-create-modal.component';
import { ignoreModalClose } from 'yti-common-ui/utils/modal';
import { ModalService } from '../../services/modal.service';
import { LanguageService } from '../../services/language.service';

@Injectable()
export class LinkListModalService {

  constructor(private modalService: ModalService) {
  }

  public open(codeSchemeId: string, restrictExternalReferenceIds: string[]): Promise<ExternalReference> {
    const modalRef = this.modalService.open(LinkListModalComponent, { size: 'sm' });
    const instance = modalRef.componentInstance as LinkListModalComponent;
    instance.codeSchemeId = codeSchemeId;
    instance.restrictExternalReferenceIds = restrictExternalReferenceIds;
    return modalRef.result;
  }
}

@Component({
  selector: 'app-link-list-modal',
  templateUrl: './link-list-modal.component.html',
  styleUrls: ['./link-list-modal.component.scss'],
  providers: [EditableService]
})
export class LinkListModalComponent implements OnInit {

  @Input() codeSchemeId: string;
  @Input() restrictExternalReferenceIds: string[];

  externalReferences: ExternalReference[] = [];
  selectedExternalReference: ExternalReference;

  loading = true;

  constructor(private modal: NgbActiveModal,
              private dataService: DataService,
              private linkCreateModalService: LinkCreateModalService,
              public languageService: LanguageService) {
  }

  ngOnInit() {
    this.dataService.getExternalReferences(this.codeSchemeId).subscribe(extReferences => {
      this.externalReferences = extReferences.filter(externalReference =>
        this.restrictExternalReferenceIds.indexOf(externalReference.id) === -1);
      this.loading = false;
    });
  }

  close() {
    this.modal.dismiss('cancel');
  }

  select() {
    console.log('Selected value: ' + this.selectedExternalReference.href);
    this.modal.close(this.selectedExternalReference);
  }

  create() {
    this.linkCreateModalService.open()
      .then(externalReference => this.modal.close(externalReference), ignoreModalClose);
  }

  canSelect() {
    return this.selectedExternalReference != null;
  }

  get externalReferencesByType(): PropertyTypeExternalReferences[] {
    return groupByType(this.externalReferences);
  }

  externalReferenceIdentity(index: number, item: ExternalReference) {
    return item.id;
  }
}
