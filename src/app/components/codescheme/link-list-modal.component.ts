import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Component, Injectable, Input, OnInit } from '@angular/core';
import { EditableService } from '../../services/editable.service';
import { ExternalReference, groupByType, PropertyTypeExternalReferences } from '../../entities/external-reference';
import { LinkCreateModalService } from './link-create-modal.component';
import { ModalService } from '../../services/modal.service';
import { LanguageService } from '../../services/language.service';
import { CodePlain } from '../../entities/code-simple';
import { PropertyType } from '../../entities/property-type';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { FilterOptions } from 'yti-common-ui/components/filter-dropdown.component';
import { CodeScheme } from '../../entities/code-scheme';

@Component({
  selector: 'app-link-list-modal',
  templateUrl: './link-list-modal.component.html',
  styleUrls: ['./link-list-modal.component.scss'],
  providers: [EditableService]
})
export class LinkListModalComponent implements OnInit {

  @Input() codeScheme: CodeScheme;
  @Input() restrictExternalReferenceIds: string[];
  @Input() languageCodes: CodePlain[];
  @Input() propertyType: PropertyType;
  @Input() propertyTypes: PropertyType[];
  @Input() externalReferences: ExternalReference[];
  
  selectedExternalReference: ExternalReference;
  filteredExternalReferences: ExternalReference[];
  
  selectedPropertyType$ = new BehaviorSubject<PropertyType|null>(null);
  propertyTypeOptions: FilterOptions<PropertyType>;

  hidden = false;

  constructor(private modal: NgbActiveModal,
              private linkCreateModalService: LinkCreateModalService,
              public languageService: LanguageService,
              public translateService: TranslateService) {
  }

  ngOnInit() {

    this.selectedPropertyType = this.propertyType;

    this.propertyTypeOptions = [null, ...this.propertyTypes].map(type => ({
      value: type,
      name: () => type ? this.languageService.translate(type.prefLabel, true)
        : this.translateService.instant('All link types'),
      idIdentifier: () => type ? type.idIdentifier : 'all_selected'
    }));

    this.selectedPropertyType$.subscribe(propertyType => {
      this.filteredExternalReferences = propertyType ? this.externalReferences.filter(extRef => extRef.propertyType!.id === propertyType.id)
                                                     : this.externalReferences;
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
    this.hidden = true;
    this.linkCreateModalService.open(this.codeScheme, this.languageCodes, this.selectedPropertyType)
      .then(externalReference => this.modal.close(externalReference), reasonToClose => this.modal.dismiss(reasonToClose));
  }

  canSelect() {
    return this.selectedExternalReference != null;
  }

  get externalReferencesByType(): PropertyTypeExternalReferences[] {
    return groupByType(this.filteredExternalReferences, this.languageService);
  }

  externalReferenceIdentity(index: number, item: ExternalReference) {
    return item.id;
  }

  get selectedPropertyType() {
    return this.selectedPropertyType$.getValue();
  }

  set selectedPropertyType(value: PropertyType | null) {
    this.selectedPropertyType$.next(value);
  }

  get modalLabel() {
    const propertyTypeName = this.selectedPropertyType ? this.languageService.translate(this.selectedPropertyType.prefLabel, true) : this.translateService.instant('link');
    return this.translateService.instant('Select') + ' ' + propertyTypeName.charAt(0).toLowerCase() + propertyTypeName.slice(1);
  }

  get createNewButtonLabel() {
    const propertyTypeName = this.selectedPropertyType ? this.languageService.translate(this.selectedPropertyType.prefLabel, true) : this.translateService.instant('link'); 
    return this.translateService.instant('Create new') + ' ' + propertyTypeName.charAt(0).toLowerCase() + propertyTypeName.slice(1);
  }
}

@Injectable()
export class LinkListModalService {

  constructor(private modalService: ModalService) {
  }

  public open(codeScheme: CodeScheme, externalReferences: ExternalReference[], languageCodes: CodePlain[], propertyType: PropertyType, propertyTypes: PropertyType[]): Promise<ExternalReference> {
    const modalRef = this.modalService.open(LinkListModalComponent, { size: 'sm' });
    const instance = modalRef.componentInstance as LinkListModalComponent;
    instance.codeScheme = codeScheme;
    instance.externalReferences = externalReferences;
    instance.languageCodes = languageCodes;
    instance.propertyType = propertyType;
    instance.propertyTypes = propertyTypes;
    return modalRef.result;
  }
}
