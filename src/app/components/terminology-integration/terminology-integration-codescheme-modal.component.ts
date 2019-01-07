import { AfterViewInit, Component, ElementRef, Injectable, Input, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DataService } from '../../services/data.service';
import { Vocabulary } from '../../entities/vocabulary';
import { LanguageService } from '../../services/language.service';
import { ModalService } from '../../services/modal.service';
import { FilterOptions } from 'yti-common-ui/components/filter-dropdown.component';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, combineLatest, concat, Observable } from 'rxjs';
import { debounceTime, skip, take } from 'rxjs/operators';
import { Concept } from '../../entities/concept';
import { CodeListErrorModalService } from '../common/error-modal.service';
import { ignoreModalClose } from 'yti-common-ui/utils/modal';
import { CodeListConfirmationModalService } from '../common/confirmation-modal.service';
import { SuggestConceptModalService } from './suggest-concept';
import { Localizable, Localizer } from 'yti-common-ui/types/localization';
import { Status, allStatuses } from 'yti-common-ui/entities/status';

function debounceSearch(search$: Observable<string>): Observable<string> {
  const initialSearch = search$.pipe(take(1));
  const debouncedSearch = search$.pipe(skip(1), debounceTime(500));
  return concat(initialSearch, debouncedSearch);
}

@Component({
  selector: 'app-terminology-integration-codescheme-modal',
  templateUrl: './terminology-integration-codescheme-modal.component.html',
  styleUrls: ['./terminology-integration-codescheme-modal.component.scss']
})
export class TerminologyIntegrationCodeschemeModalComponent implements OnInit, AfterViewInit {

  @Input() updatingExistingEntity = true;
  @Input() targetEntityKind: string; // code or codescheme

  vocabularyOptions: FilterOptions<Vocabulary>;
  vocabulary$ = new BehaviorSubject<Vocabulary | null>(null);
  statusOptions: FilterOptions<Status>;
  status$ = new BehaviorSubject<Status | null>(null);
  loading = false;

  @ViewChild('searchInput') searchInput: ElementRef;

  searchResults: Concept[];
  search$ = new BehaviorSubject('');
  debouncedSearch$ = debounceSearch(this.search$);
  cancelText: string;
  terminologyIntegrationModalPageTitle: string;
  terminologyIntegrationModalInstructionText: string;
  localizer: Localizer;

  constructor(private dataService: DataService,
              private modal: NgbActiveModal,
              public languageService: LanguageService,
              private translateService: TranslateService,
              private codeListErrorModalService: CodeListErrorModalService,
              private codeListConfirmationModalService: CodeListConfirmationModalService,
              private suggestConceptModalService: SuggestConceptModalService) {
  }

  ngOnInit() {

    combineLatest(this.vocabulary$, this.debouncedSearch$, this.status$)
      .subscribe(([vocabulary, search, status]) => {

        if (!search) {
          this.searchResults = [];
        } else {
          this.loading = true;
          this.dataService.getConcepts(search, vocabulary ? vocabulary.id : null, status ? status.toString() : null).subscribe(concepts => {
              this.loading = false;
              this.searchResults = concepts.sort((a , b) => {
                if (this.languageService.translate(a.prefLabel, true).toLowerCase() < this.languageService.translate(b.prefLabel, true).toLowerCase()) { return -1; }
                if (this.languageService.translate(a.prefLabel, true).toLowerCase() > this.languageService.translate(b.prefLabel, true).toLowerCase()) { return 1; }
                return 0;
              });
            },
            error => {
              this.loading = false;
              this.codeListErrorModalService.openSubmitError(error);
            });
        }
      });

    this.dataService.getVocabularies().subscribe(vocabularies => {

      const vocabulariesSorted = vocabularies.sort((a , b) => {
        if (this.languageService.translate(a.prefLabel, true).toLowerCase() < this.languageService.translate(b.prefLabel, true).toLowerCase()) { return -1; }
        if (this.languageService.translate(a.prefLabel, true).toLowerCase() > this.languageService.translate(b.prefLabel, true).toLowerCase()) { return 1; }
        return 0;
      });

      this.vocabularyOptions = [null, ...vocabulariesSorted].map(voc => ({
          value: voc,
          name: () => voc ? this.languageService.translate(voc.prefLabel, false)
            : this.translateService.instant('All vocabularies'),
          idIdentifier: () => voc ? voc.getIdIdentifier(this.languageService, true)
            : 'all_selected'
        })
      );

    }, error => {
      this.vocabularyOptions = [
        { value: null, name: () => this.translateService.instant('All vocabularies') }];
      this.codeListErrorModalService.openSubmitError(error);
    });

    this.statusOptions = [null, ...allStatuses].map(theStatus => ({
        value: theStatus,
        name: () => theStatus ? this.translateService.instant(theStatus)
          : this.translateService.instant('All statuses'),
        idIdentifier: () => theStatus ? theStatus
          : 'all_selected'
      })
    );

    if (this.targetEntityKind === 'code') {
      if (!this.updatingExistingEntity) {
        this.cancelText = 'cancelTextForCodeCreation';
        this.terminologyIntegrationModalPageTitle = 'terminologyIntegrationModalPageTitleWhenCreatingCode';
      } else {
        this.cancelText = 'Cancel';
        this.terminologyIntegrationModalPageTitle = 'Get concept from Controlled Vocabularies';
      }
      this.terminologyIntegrationModalInstructionText = 'terminologyIntegrationModalInstructionTextWhenCreatingCode';
    } else if (this.targetEntityKind === 'codescheme') {
      if (!this.updatingExistingEntity) {
        this.cancelText = 'cancelTextForCodeSchemeCreation';
        this.terminologyIntegrationModalPageTitle = 'terminologyIntegrationModalPageTitleWhenCreatingCodeScheme';
      } else {
        this.cancelText = 'Cancel';
        this.terminologyIntegrationModalPageTitle = 'Get concept from Controlled Vocabularies';
      }
      this.terminologyIntegrationModalInstructionText = 'terminologyIntegrationModalInstructionTextWhenCreatingCodeScheme';
    }
  }

  ngAfterViewInit() {
    this.searchInput.nativeElement.focus();
  }

  hasSearchResults() {
    return this.searchResults.length > 0;
  }

  close() {
    this.modal.dismiss('cancel');
  }

  select(concept: Concept) {
    this.modal.close(concept);
  }

  get search() {
    return this.search$.getValue();
  }

  set search(value: string) {
    this.search$.next(value);
  }

  cancel() {
    this.modal.dismiss('cancel');
  }

  canSuggest() {
    const vocabulary: Vocabulary | null = this.vocabulary$.getValue();
    const vocabularyId: string = vocabulary != null ? vocabulary.id : '';
    return vocabularyId !== '' && this.search$.getValue() !== '';
  }

  suggestAConcept(localizer: Localizer) {

    const vocabulary: Vocabulary | null = this.vocabulary$.getValue();
    const vocabularyName: string = vocabulary != null ? vocabulary.getDisplayName(this.languageService, true) : '';

    const conceptName: Localizable = { [this.languageService.language]: this.search$.getValue() };

    this.suggestConceptModalService.open(conceptName).then((result) => {
      const suggestionNameLocalized: string = this.languageService.translate(result[0], true);
      const suggestionDefinitionLocalized: string = this.languageService.translate(result[1], true);
      const resultArray: string[] = [suggestionNameLocalized, suggestionDefinitionLocalized];
      this.codeListConfirmationModalService.openSuggestConcept(resultArray[0], resultArray[1], vocabularyName)
        .then(() => {
          const vocabularyId: string = vocabulary != null ? vocabulary.id : '';
          return this.dataService.suggestAConcept(resultArray[0], resultArray[1], vocabularyId, this.languageService.contentLanguage).subscribe(next => {
            const conceptSuggestions: Concept[] = next;
            this.select(next[0]);
          });
        }, ignoreModalClose);
    }, ignoreModalClose);
  }

}

@Injectable()
export class TerminologyIntegrationModalService {

  constructor(private modalService: ModalService) {
  }

  public open(updatingExistingEntity: boolean, targetEntityKind: string): Promise<Concept> {
    const modalRef = this.modalService.open(TerminologyIntegrationCodeschemeModalComponent, { size: 'lg' });
    const instance = modalRef.componentInstance as TerminologyIntegrationCodeschemeModalComponent;
    instance.updatingExistingEntity = updatingExistingEntity;
    instance.targetEntityKind = targetEntityKind;
    return modalRef.result;
  }
}

