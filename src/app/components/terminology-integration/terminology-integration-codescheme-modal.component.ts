import {
  Component,
  ElementRef,
  Injectable,
  ViewChild,
  Renderer
} from '@angular/core';
import {EditableService} from '../../services/editable.service';
import {Router} from '@angular/router';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {DataService} from '../../services/data.service';
import {Vocabulary} from '../../entities/vocabulary';
import { LanguageService } from '../../services/language.service';
import {ModalService} from '../../services/modal.service';
import { OnInit } from '@angular/core';
import {FilterOptions} from 'yti-common-ui/components/filter-dropdown.component';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {TranslateService} from 'ng2-translate';
import {Observable} from 'rxjs/Rx';
import {Concept} from '../../entities/concept';
import {CodeListErrorModalService} from '../common/error-modal.service';

function debounceSearch(search$: Observable<string>): Observable<string> {
  const initialSearch = search$.take(1);
  const debouncedSearch = search$.skip(1).debounceTime(500);
  return initialSearch.concat(debouncedSearch);
}

@Injectable()
export class TerminologyIntegrationModalService {

  constructor(private modalService: ModalService) {
  }

  public open(showSimpleCancelLinkText: boolean): Promise<Concept> {
    const modalRef = this.modalService.open(TerminologyIntegrationCodeschemeModalComponent, {size: 'lg'});
    const instance = modalRef.componentInstance as TerminologyIntegrationCodeschemeModalComponent;
    instance.showSimpleCancelLinkText = showSimpleCancelLinkText;
    return modalRef.result;
  }
}


@Component({
  selector: 'app-terminology-integration-codescheme-modal',
  templateUrl: './terminology-integration-codescheme-modal.component.html',
  styleUrls: ['./terminology-integration-codescheme-modal.component.scss'],
  providers: [EditableService]
})
export class TerminologyIntegrationCodeschemeModalComponent implements OnInit {

  vocabularyOptions: FilterOptions<Vocabulary>;
  vocabulary$ = new BehaviorSubject<Vocabulary|null>(null);
  nrOfSearchResults: number = -1;
  showSimpleCancelLinkText = true;
  loading = true;

  @ViewChild('searchInput') searchInput: ElementRef;

  searchResults: Concept[];
  search$ = new BehaviorSubject('');

  constructor(private editableService: EditableService,
              private dataService: DataService,
              private router: Router,
              private modal: NgbActiveModal,
              private languageService: LanguageService,
              private translateService: TranslateService,
              private renderer: Renderer,
              private codeListErrorModalService: CodeListErrorModalService) {
  }

  ngOnInit() {
    Observable.combineLatest(this.vocabulary$, debounceSearch(this.search$))
      .subscribe(([vocabulary, search]) => {
        if (!search) {
          this.nrOfSearchResults = 0;
          return;
        }
        this.loading = true;
        this.dataService.getConcepts(search, vocabulary ? vocabulary.id : null).subscribe(concepts => {
            this.loading = false;
            this.searchResults = concepts;
            this.nrOfSearchResults = concepts.length;
          },
          err => this.codeListErrorModalService.openSubmitError(err));
      });


    this.dataService.getVocabularies().subscribe(vocabularies => {
      this.vocabularyOptions = [null, ...vocabularies].map(voc => ({
        value: voc,
        name: () => voc ? this.languageService.translate(voc.prefLabel, true)
          : this.translateService.instant('All vocabularies')
      }));
      this.renderer.invokeElementMethod(this.searchInput.nativeElement, 'focus');
    }, error => {
      this.vocabularyOptions = [
        { value: null, name: () => this.translateService.instant('All vocabularies')}];
      this.codeListErrorModalService.openSubmitError(error);
    });
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
}
