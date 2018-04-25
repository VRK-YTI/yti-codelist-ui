import {Component, ElementRef, Injectable, Input, ViewChild, Renderer, OnChanges, AfterViewInit} from '@angular/core';
import {EditableService} from '../../services/editable.service';
import {Router} from '@angular/router';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {DataService} from '../../services/data.service';
import {Vocabulary} from '../../entities/Vocabulary';
import { LanguageService } from '../../services/language.service';
import {ModalService} from '../../services/modal.service';
import { OnInit } from '@angular/core';
import {FilterOptions} from 'yti-common-ui/components/filter-dropdown.component';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {TranslateService} from 'ng2-translate';
import {Observable} from 'rxjs/Rx';
import {Concept} from '../../entities/concept';

@Injectable()
export class TerminologyIntegrationModalService {

  constructor(private modalService: ModalService) {
  }

  public open(): Promise<Concept> {
    const modalRef = this.modalService.open(TerminologyIntegrationCodeSchemeComponent, {size: 'sm'});
    return modalRef.result;
  }
}


@Component({
  selector: 'app-terminology-integration-codescheme-modal',
  templateUrl: './terminology-integration-codescheme-modal.component.html',
  providers: [EditableService]
})
export class TerminologyIntegrationCodeSchemeComponent implements OnInit, OnChanges, AfterViewInit {

  vocabularyOptions: FilterOptions<Vocabulary>;
  vocabulary$ = new BehaviorSubject<Vocabulary|null>(null);

  @ViewChild('searchInput') searchInput: ElementRef;

  searchResults$: Observable<Concept[]>;
  search$ = new BehaviorSubject('');

  constructor(private editableService: EditableService,
              private dataService: DataService,
              private router: Router,
              private modal: NgbActiveModal,
              private languageService: LanguageService,
              private translateService: TranslateService,
              private renderer: Renderer) {
  }

  ngOnInit() {

    this.dataService.getVocabularies().subscribe(vocabularies => {
      this.vocabularyOptions = [null, ...vocabularies].map(voc => ({
        value: voc,
        name: () => voc ? this.languageService.translate(voc.prefLabel, true)
          : this.translateService.instant('All vocabularies')
      }));
    });

    Observable.combineLatest(this.vocabulary$, this.search$)
      .debounceTime(500)
      .distinctUntilChanged()
      .subscribe(() => this.goSearch(this.search$.getValue()));

  }

  ngOnChanges() {
    this.goSearch(this.search$.getValue());
  }

  close() {
    this.modal.dismiss('cancel');
  }

  select(concept: Concept) {
    this.modal.close(concept);
  }

  ngAfterViewInit() {
    this.renderer.invokeElementMethod(this.searchInput.nativeElement, 'focus');
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

  goSearch(searchTerm: string) {
    if (!searchTerm) {
      return;
    }
    let vocab = '0';
    if (this.vocabulary$.getValue() != null) {
      vocab = this.vocabulary$.getValue()!.id;
    }
    this.dataService.getConcepts(searchTerm, vocab ).subscribe(concepts => {
      this.searchResults$ = Observable.of(concepts);
    });
  }
}
