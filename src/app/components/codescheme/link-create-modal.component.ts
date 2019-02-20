import { AfterViewInit, Component, Injectable, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ExternalReference } from '../../entities/external-reference';
import { EditableService } from '../../services/editable.service';
import { ModalService } from '../../services/modal.service';
import { CodePlain } from '../../entities/code-simple';
import { PropertyType } from '../../entities/property-type';
import { FormControl, FormGroup } from '@angular/forms';
import { map } from 'rxjs/operators';
import { CodeScheme } from '../../entities/code-scheme';
import { ExternalReferenceType } from '../../services/api-schema';
import { DataService } from '../../services/data.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-link-create-modal',
  templateUrl: './link-create-modal.component.html',
  providers: [EditableService]
})
export class LinkCreateModalComponent implements OnInit, AfterViewInit {

  @Input() languageCodes: CodePlain[];
  @Input() propertyType: PropertyType | null;
  @Input() codeScheme: CodeScheme;

  externalReferenceForm = new FormGroup({
    title: new FormControl({}),
    description: new FormControl({}),
    href: new FormControl(''),
    propertyType: new FormControl('')
  });

  constructor(private editableService: EditableService,
              private modal: NgbActiveModal,
              private dataService: DataService) {

    this.editableService.edit();
  }

  ngOnInit() {
    if (this.propertyType) {
      this.externalReferenceForm.controls['propertyType'].setValue(this.propertyType);
    }
    this.externalReferenceForm.updateValueAndValidity();
  }

  ngAfterViewInit() {
    if (this.codeScheme && this.codeScheme.id) {
      this.externalReferenceForm.controls['href'].setAsyncValidators(this.externalReferenceExistsValidator.bind(this));
    }
  }

  close() {
    this.modal.dismiss('cancel');
  }

  add() {
    const externalReferenceType: ExternalReferenceType = <ExternalReferenceType> {
      global: false,
      title: this.externalReferenceForm.controls['title'].value,
      description: this.externalReferenceForm.controls['description'].value,
      propertyType: this.externalReferenceForm.controls['propertyType'].value,
      href: this.externalReferenceForm.controls['href'].value
    };
    const externalReference: ExternalReference = new ExternalReference(externalReferenceType);
    this.modal.close(externalReference);
  }

  externalReferenceExistsValidator(): Observable<any> {
    const schemeCodeValue = this.codeScheme.codeValue;
    const registryCodeValue = this.codeScheme.codeRegistry.codeValue;
    const externalReferenceHref = this.externalReferenceForm.controls['href'].value;
    const validationError = {
      externalReferenceExists: {
        valid: false
      }
    };
    return this.dataService.externalReferenceExists(registryCodeValue, schemeCodeValue, externalReferenceHref)
      .pipe(map(exists => exists ? validationError : null));
  }
}

@Injectable()
export class LinkCreateModalService {

  constructor(private modalService: ModalService) {
  }

  public open(codeScheme: CodeScheme, languageCodes: CodePlain[], propertyType: PropertyType | null): Promise<ExternalReference> {
    const modalRef = this.modalService.open(LinkCreateModalComponent, { size: 'sm', backdrop: 'static', keyboard: false });
    const instance = modalRef.componentInstance as LinkCreateModalComponent;
    instance.codeScheme = codeScheme;
    instance.languageCodes = languageCodes;
    instance.propertyType = propertyType;
    return modalRef.result;
  }
}

