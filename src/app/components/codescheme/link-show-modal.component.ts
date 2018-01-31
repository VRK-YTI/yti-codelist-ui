import { Component, Injectable, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CC0LicenseLinkId, CCBy40LicenseLinkId, ExternalReference } from '../../entities/external-reference';
import { EditableService } from '../../services/editable.service';
import { Localizable } from 'yti-common-ui/types/localization';
import { LanguageService } from '../../services/language.service';
import { ModalService } from '../../services/modal.service';

const CCBy40LicenseImage = 'assets/images/ccby40-icon-88x31.png';
const CC0LicenseImage = 'assets/images/cc0-icon-88x31.png';
const titleCCBy40: Localizable = {
  'fi': 'Creative Commons -lisenssi',
  'sv': 'Creative Commons-licens',
  'en': 'Creative Commons License'
};

@Injectable()
export class LinkShowModalService {

  constructor(private modalService: ModalService) {
  }

  public open(externalReference: ExternalReference): void {
    const modalRef = this.modalService.open(LinkShowModalComponent, {size: 'sm'});
    const instance = modalRef.componentInstance as LinkShowModalComponent;
    instance.externalReference = externalReference;
  }
}

@Component({
  selector: 'app-link-show-modal',
  templateUrl: './link-show-modal.component.html',
  styleUrls: ['./link-show-modal.component.scss'],
  providers: [EditableService]
})
export class LinkShowModalComponent {

  @Input() externalReference: ExternalReference;

  srcCCBy40 = CCBy40LicenseImage;
  srcCC0 = CC0LicenseImage;

  constructor(private modal: NgbActiveModal,
              private languageService: LanguageService) {
  }

  close() {
    this.modal.dismiss('cancel');
  }

  get CCBy40LicenseLink() {
    return this.externalReference.id === CCBy40LicenseLinkId;
  }

  get CC0LicenseLink() {
    return this.externalReference.id === CC0LicenseLinkId;
  }

  get titleCCBy40() {
    return this.languageService.translate(titleCCBy40);
  }
}
