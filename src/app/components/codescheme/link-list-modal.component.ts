import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Component, Injectable, Input, OnInit } from '@angular/core';
import { EditableService } from '../../services/editable.service';
import { ExternalReference, groupByType, PropertyTypeExternalReferences } from '../../entities/external-reference';
import { DataService } from '../../services/data.service';
import { LinkCreateModalService } from './link-create-modal.component';
import { ignoreModalClose } from 'yti-common-ui/utils/modal';
import { ModalService } from '../../services/modal.service';
import { LanguageService } from '../../services/language.service';
import { CodePlain } from '../../entities/code-simple';
import { PropertyType } from '../../entities/property-type';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-link-list-modal',
  templateUrl: './link-list-modal.component.html',
  styleUrls: ['./link-list-modal.component.scss'],
  providers: [EditableService]
})
export class LinkListModalComponent {

  @Input() codeSchemeId: string;
  @Input() restrictExternalReferenceIds: string[];
  @Input() languageCodes: CodePlain[];
  @Input() propertyType: PropertyType;
  @Input() externalReferences: ExternalReference[];
  
  selectedExternalReference: ExternalReference;

  constructor(private modal: NgbActiveModal,
              private dataService: DataService,
              private linkCreateModalService: LinkCreateModalService,
              public languageService: LanguageService,
              public translateService: TranslateService) {
  }

  close() {
    this.modal.dismiss('cancel');
  }

  select() {
    console.log('Selected value: ' + this.selectedExternalReference.href);
    this.modal.close(this.selectedExternalReference);
  }

  create() {
    this.linkCreateModalService.open(this.languageCodes, this.propertyType)
      .then(externalReference => this.modal.close(externalReference), ignoreModalClose);
  }

  canSelect() {
    return this.selectedExternalReference != null;
  }

  get externalReferencesByType(): PropertyTypeExternalReferences[] {
    return groupByType(this.externalReferences, this.languageService);
  }

  externalReferenceIdentity(index: number, item: ExternalReference) {
    return item.id;
  }

  get modalLabel() {
    const propertyTypeName = this.languageService.translate(this.propertyType.prefLabel, true);
    return this.translateService.instant('Select') + ' ' + propertyTypeName.charAt(0).toLowerCase() + propertyTypeName.slice(1);
  }

  get createNewButtonLabel() {
    const propertyTypeName = this.languageService.translate(this.propertyType.prefLabel, true); 
    return this.translateService.instant('Create new') + ' ' + propertyTypeName.charAt(0).toLowerCase() + propertyTypeName.slice(1);
  }
}

@Injectable()
export class LinkListModalService {

  constructor(private modalService: ModalService) {
  }

  public open(codeSchemeId: string, externalReferences: ExternalReference[], languageCodes: CodePlain[], propertyType: PropertyType): Promise<ExternalReference> {
    const modalRef = this.modalService.open(LinkListModalComponent, { size: 'sm' });
    const instance = modalRef.componentInstance as LinkListModalComponent;
    instance.codeSchemeId = codeSchemeId;
    instance.externalReferences = externalReferences;
    instance.languageCodes = languageCodes;
    instance.propertyType = propertyType;
    return modalRef.result;
  }
}
