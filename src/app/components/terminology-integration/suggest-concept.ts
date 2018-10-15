import { Component, Injectable, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ExternalReference } from '../../entities/external-reference';
import { EditableService } from '../../services/editable.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalService } from '../../services/modal.service';
import { CodePlain } from '../../entities/code-simple';
import { ConceptSuggestion } from '../../entities/concept-suggestion';
import { ConceptSuggestionType } from '../../services/api-schema';
import { Localizable } from 'yti-common-ui/types/localization';
import { LanguageService } from '../../services/language.service';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { validate } from 'codelyzer/walkerFactory/walkerFn';

@Component({
  selector: 'app-suggest-concept-modal',
  templateUrl: './suggest-concept-modal.component.html',
  providers: [EditableService]
})
export class SuggestConceptModalComponent implements OnInit {

  @Input() conceptNameIncomiming: string;
  conceptDefinition: string;
  conceptSuggestion: ConceptSuggestion;

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
    console.log(this.conceptNameIncomiming);
    this.conceptSuggestionForm.patchValue({'fi': this.conceptNameIncomiming});
  }

  saveValues() {
    this.modal.close([this.conceptSuggestionForm.value.conceptName, this.conceptSuggestionForm.value.conceptDefinition]);
  }

  cancel() {
    this.modal.dismiss('cancel');
  }

  canSavexx() {
    return this.conceptSuggestionForm.valid;
  }
}

@Injectable()
export class SuggestConceptModalService {

  constructor(private modalService: ModalService) {
  }

  public open(conceptName: string): Promise<Localizable[]> {
    const modalRef = this.modalService.open(SuggestConceptModalComponent, { size: 'sm' });
    const instance = modalRef.componentInstance as SuggestConceptModalComponent;
    instance.conceptNameIncomiming = conceptName;
    return modalRef.result;
  }
}
