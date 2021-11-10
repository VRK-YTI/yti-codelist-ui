import { Component, Injectable, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { EditableService } from '../../services/editable.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LanguageService } from '../../services/language.service';
import { TranslateService } from '@ngx-translate/core';
import { Localizable, ModalService } from '@vrk-yti/yti-common-ui';

@Component({
  selector: 'app-suggest-concept-modal',
  templateUrl: './suggest-concept-modal.component.html',
  providers: [EditableService]
})
export class SuggestConceptModalComponent implements OnInit {

  @Input() conceptNameIncoming: Localizable;
  @Input() language: string;

  conceptSuggestionForm = new FormGroup({
    conceptName: new FormControl(Validators.required),
    conceptDefinition: new FormControl(Validators.required)
  });

  constructor(public languageService: LanguageService,
              private translateService: TranslateService,
              private editableService: EditableService,
              private modal: NgbActiveModal) {
    this.editableService.edit();
  }

  ngOnInit() {
    this.conceptSuggestionForm.patchValue({ conceptName: this.conceptNameIncoming });
    const initialConceptDefinition = { [this.language]: '' };
    this.conceptSuggestionForm.patchValue({ conceptDefinition: initialConceptDefinition });
  }

  saveValues() {
    this.modal.close([this.conceptSuggestionForm.value.conceptName, this.conceptSuggestionForm.value.conceptDefinition]);
  }

  cancel() {
    this.modal.dismiss('cancel');
  }

  close() {
    this.cancel();
  }

  canSave() {
    return (this.languageService.translate(this.conceptSuggestionForm.value.conceptName, true).length > 0 &&
      this.languageService.translate(this.conceptSuggestionForm.value.conceptDefinition, true).length > 0)
  }
}

@Injectable()
export class SuggestConceptModalService {

  constructor(private modalService: ModalService) {
  }

  public open(conceptName: Localizable, language: string): Promise<Localizable[]> {
    const modalRef = this.modalService.open(SuggestConceptModalComponent, { size: 'sm', backdrop: 'static', keyboard: false });
    const instance = modalRef.componentInstance as SuggestConceptModalComponent;
    instance.conceptNameIncoming = conceptName;
    instance.language = language;
    return modalRef.result;
  }
}
