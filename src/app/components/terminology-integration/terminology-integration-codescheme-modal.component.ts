import { AfterViewInit, Component, ElementRef, Injectable, Input, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DataService } from '../../services/data.service';
import { Vocabulary } from '../../entities/vocabulary';
import { LanguageService } from '../../services/language.service';
import { ModalService } from 'yti-common-ui/services/modal.service';
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
import { allStatuses, Status } from 'yti-common-ui/entities/status';
import { Code } from '../../entities/code';
import { Meta } from '../../entities/meta';
import { comparingLocalizable, comparingPrimitive } from 'yti-common-ui/utils/comparator';

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
  vocabulariesSortedAlphabetically: Vocabulary[] = [];
  statusOptions: FilterOptions<Status>;
  status$ = new BehaviorSubject<Status | null>(null);
  languageOptions: FilterOptions<Code>;
  language$ = new BehaviorSubject<Code | null>(null);
  allLanguagesFromVocabulariesAsStrings: string[] = [];
  allLanguagesFromVocabulariesAsCodes: Code[] = [];
  chosenVocabularysLanguagesAsCodes: Code[] = [];
  loading = false;
  meta: Meta | undefined;

  @ViewChild('searchInput') searchInput: ElementRef;

  searchResults: Concept[];
  search$ = new BehaviorSubject('');
  debouncedSearch$ = debounceSearch(this.search$);
  cancelText: string;
  terminologyIntegrationModalPageTitle: string;
  terminologyIntegrationModalInstructionText: string;
  localizer: Localizer;
  chosenLanguageCodeValue: string | null;
  chosenLanguageCode: Code | null;

  constructor(private dataService: DataService,
              private modal: NgbActiveModal,
              public languageService: LanguageService,
              private translateService: TranslateService,
              private codeListErrorModalService: CodeListErrorModalService,
              private codeListConfirmationModalService: CodeListConfirmationModalService,
              private suggestConceptModalService: SuggestConceptModalService) {
  }

  ngOnInit() {

    combineLatest(this.vocabulary$, this.debouncedSearch$, this.status$, this.language$)
      .subscribe(([vocabulary, search, status, language]) => {
        if (!search && !vocabulary) {
          this.searchResults = [];
          this.meta = undefined;
        } else {
          this.loading = true;
          this.meta = undefined;

          let languageCode: string | null = language ? language.codeValue.substring(0, language.codeValue.lastIndexOf('-')) : null;
          if (languageCode === null || languageCode.length === 0) {
            languageCode = language ? language.codeValue.substring(0, 2) : null;
          }

          this.chosenLanguageCodeValue = languageCode;
          this.chosenLanguageCode = language;

          this.dataService.getConcepts(search, vocabulary ? vocabulary.uri : null, status ? status.toString() : null, languageCode).subscribe(conceptsResponse => {
              this.loading = false;
              this.meta = conceptsResponse.meta;

              const foundConcepts = conceptsResponse.concepts.sort((a, b) => {
                if (this.languageService.translateToGivenLanguage(a.prefLabel, languageCode).toLowerCase() < this.languageService.translateToGivenLanguage(b.prefLabel, languageCode).toLowerCase()) {
                  return -1;
                }
                if (this.languageService.translateToGivenLanguage(a.prefLabel, languageCode).toLowerCase() > this.languageService.translateToGivenLanguage(b.prefLabel, languageCode).toLowerCase()) {
                  return 1;
                }

                return 0;
              });

              foundConcepts.forEach( concept => { // The integration API that gives us concepts only has vocabulary's URI anymore so need to manually populate here.
                this.vocabulariesSortedAlphabetically.forEach( vocab => {
                  if (vocab.uri === concept.containerUri) {
                    concept.vocabularyPrefLabel = vocab.prefLabel;
                  }
                })
              });

              foundConcepts.sort(comparingPrimitive<Concept>(
                concept => this.languageService.isLocalizableEmpty(concept.prefLabel))
                .andThen(comparingPrimitive<Concept>(concept =>
                  this.languageService.isLocalizableEmpty(concept.prefLabel) ? concept.uri.toLowerCase() : null))
                .andThen(comparingLocalizable<Concept>(this.languageService,
                  concept => concept.prefLabel ? concept.prefLabel : {}, true)));

              this.searchResults = foundConcepts;
            },
            error => {
              this.loading = false;
              this.codeListErrorModalService.openSubmitError(error);
            });
        }
      });

    this.dataService.getVocabularies().subscribe(vocabularies => {
      const vocabulariesSorted = vocabularies.sort((a, b) => {
        if (this.languageService.translate(a.prefLabel, true).toLowerCase() < this.languageService.translate(b.prefLabel, true).toLowerCase()) {
          return -1;
        }
        if (this.languageService.translate(a.prefLabel, true).toLowerCase() > this.languageService.translate(b.prefLabel, true).toLowerCase()) {
          return 1;
        }
        return 0;
      });
      vocabulariesSorted.forEach(vocabulary => {
        vocabulary.languages.forEach(language => {
          if (!this.allLanguagesFromVocabulariesAsStrings.includes(language, 0)) {
            this.allLanguagesFromVocabulariesAsStrings.push(language);
          }
        });
      });

      this.vocabulariesSortedAlphabetically = vocabulariesSorted;

      this.vocabularyOptions = [null, ...vocabulariesSorted].map(voc => ({
          value: voc,
          name: () => voc ? this.languageService.translate(voc.prefLabel, false) + (voc.status ? ' (' + this.translateService.instant(voc.status) + ') ' : '')
            : this.translateService.instant('All vocabularies'),
          idIdentifier: () => voc ? voc.getIdIdentifier(this.languageService, true)
            : 'all_selected'
        })
      );

      this.dataService.getLanguageCodes(this.languageService.language).subscribe(allLanguages => {

        const languagesAsCodesSorted = allLanguages.sort((a, b) => {
          if (this.languageService.translate(a.prefLabel, true).toLowerCase() < this.languageService.translate(b.prefLabel, true).toLowerCase()) {
            return -1;
          }
          if (this.languageService.translate(a.prefLabel, true).toLowerCase() > this.languageService.translate(b.prefLabel, true).toLowerCase()) {
            return 1;
          }
          return 0;
        });

        this.allLanguagesFromVocabulariesAsCodes = languagesAsCodesSorted.filter(code => this.allLanguagesFromVocabulariesAsStrings.includes(code.codeValue));

        this.languageOptions = [null, ...this.allLanguagesFromVocabulariesAsCodes].map(theLanguage => ({
          value: theLanguage,
          name: () => theLanguage ? this.languageService.translate(theLanguage.prefLabel, true) : this.translateService.instant('All languages'),
          idIdentifier: () => theLanguage ? theLanguage.codeValue : 'all_selected'
        }));
      }, error => {
        console.log(error);
        this.languageOptions = [
          { value: null, name: () => this.translateService.instant('All languages') }];
        this.codeListErrorModalService.openSubmitError(error);
      });


    }, error => {
      console.log(error);
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
        this.terminologyIntegrationModalPageTitle = 'Get concept from Terminologies';
      }
      this.terminologyIntegrationModalInstructionText = 'terminologyIntegrationModalInstructionTextWhenCreatingCode';
    } else if (this.targetEntityKind === 'codescheme') {
      if (!this.updatingExistingEntity) {
        this.cancelText = 'cancelTextForCodeSchemeCreation';
        this.terminologyIntegrationModalPageTitle = 'terminologyIntegrationModalPageTitleWhenCreatingCodeScheme';
      } else {
        this.cancelText = 'Cancel';
        this.terminologyIntegrationModalPageTitle = 'Get concept from Terminologies';
      }
      this.terminologyIntegrationModalInstructionText = 'terminologyIntegrationModalInstructionTextWhenCreatingCodeScheme';
    }

    // When the user changes Vocabulary we only want to show the language options in the dropdown which are inherent to that particular Vocabulary.
    // ie. if some other Vocabulary contains Spanish terms but the currently selected Vocabulary does not, we will not show Spanish as an option at this time.
    // Meaning that the list of language dropdown options is dynamically updated every time the user changes the selected Vocabulary.
    this.vocabulary$.subscribe(next => {

      this.chosenVocabularysLanguagesAsCodes = [];
      const chosenVocabulary: Vocabulary | null = next;
      let chosenVocabularysLanguagesAsStrings: string[] = [];
      if (chosenVocabulary != null) {
        chosenVocabularysLanguagesAsStrings = chosenVocabulary.languages; // NOTE! The Vocabulary coming from Terminology API only contains strings like "en", "fi", "sv"
      }

      const allLanguagesFromVocabulariesAsCodesSorted = this.allLanguagesFromVocabulariesAsCodes.sort((a, b) => {
        if (this.languageService.translate(a.prefLabel, true).toLowerCase() < this.languageService.translate(b.prefLabel, true).toLowerCase()) {
          return -1;
        }
        if (this.languageService.translate(a.prefLabel, true).toLowerCase() > this.languageService.translate(b.prefLabel, true).toLowerCase()) {
          return 1;
        }
        return 0;
      });

      allLanguagesFromVocabulariesAsCodesSorted.forEach(lang => {
        if (chosenVocabularysLanguagesAsStrings.includes(lang.codeValue)) {
          this.chosenVocabularysLanguagesAsCodes.push(lang);
        }
      });

      let languageSelectedFromDropdown: Code | null = null;
      this.language$.subscribe(next2 => {
        languageSelectedFromDropdown = next2;
      });

      if (languageSelectedFromDropdown !== null) {
        if (!this.chosenVocabularysLanguagesAsCodes.includes(languageSelectedFromDropdown)) {
          this.language$.next(null); // Empty the value from language dropdown if current lang does not exist in the new Vocabulary just selected.
        }
      }

      if (chosenVocabulary === null) { // Finally repopulate the language dropdown options according to the situation
        this.languageOptions = [null, ...this.allLanguagesFromVocabulariesAsCodes].map(theLanguage => ({
          value: theLanguage,
          name: () => theLanguage ? this.languageService.translate(theLanguage.prefLabel, true) : this.translateService.instant('All languages'),
          idIdentifier: () => theLanguage ? theLanguage.codeValue : 'all_selected'
        }));
      } else {
        this.languageOptions = [null, ...this.chosenVocabularysLanguagesAsCodes].map(theLanguage => ({
          value: theLanguage,
          name: () => theLanguage ? this.languageService.translate(theLanguage.prefLabel, true) : this.translateService.instant('All languages'),
          idIdentifier: () => theLanguage ? theLanguage.codeValue : 'all_selected'
        }));
      }

    });
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
    const vocabularyUri: string = vocabulary == null ? '' : vocabulary.uri;
    return vocabularyUri !== '' && this.search$.getValue() !== '';
  }

  suggestAConcept() {

    const vocabulary: Vocabulary | null = this.vocabulary$.getValue();
    const vocabularyName: string = vocabulary != null ? vocabulary.getDisplayName(this.languageService, true) : '';

    const conceptName: Localizable = { [this.languageService.language]: this.search$.getValue() };
    this.suggestConceptModalService.open(conceptName).then((result) => {
      const suggestionNameLocalized: string = this.languageService.translate(result[0], true);
      const suggestionDefinitionLocalized: string = this.languageService.translate(result[1], true);
      const resultArray: string[] = [suggestionNameLocalized, suggestionDefinitionLocalized];
      this.codeListConfirmationModalService.openSuggestConcept(resultArray[0], resultArray[1], vocabularyName)
        .then(() => {
          const vocabularyUri: string = vocabulary == null ? '' : vocabulary.uri;
          return this.dataService.suggestAConcept(resultArray[0], resultArray[1], vocabularyUri, this.languageService.contentLanguage).subscribe(next => {
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
    const modalRef = this.modalService.open(TerminologyIntegrationCodeschemeModalComponent, { size: 'lg', backdrop: 'static', keyboard: false });
    const instance = modalRef.componentInstance as TerminologyIntegrationCodeschemeModalComponent;
    instance.updatingExistingEntity = updatingExistingEntity;
    instance.targetEntityKind = targetEntityKind;
    return modalRef.result;
  }
}

