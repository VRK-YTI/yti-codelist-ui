import { AfterViewInit, Component, ElementRef, Injectable, Input, OnInit, Renderer, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, combineLatest, concat, Observable } from 'rxjs';
import { LanguageService } from '../../services/language.service';
import { contains } from 'yti-common-ui/utils/array';
import { ModalService } from '../../services/modal.service';
import { CodeScheme } from '../../entities/code-scheme';
import { DataService } from '../../services/data.service';
import { debounceTime, map, skip, take, tap } from 'rxjs/operators';

@Component({
  selector: 'app-search-linked-code-scheme-modal',
  styleUrls: ['./search-linked-code-scheme-modal.component.scss'],
  template: `
    <div class="modal-header">
      <h4 class="modal-title">
        <a><i id="close_modal_link" class="fa fa-times" (click)="cancel()"></i></a>
        <span>{{titleLabel}}</span>
      </h4>
    </div>
    <div class="modal-body full-height">

      <div class="row mb-2">
        <div class="col-12">

          <div class="input-group input-group-lg input-group-search">
            <input #searchInput id="search_linked_code-scheme_input" type="text" class="form-control"
                   [placeholder]="searchLabel"
                   [(ngModel)]="search"/>
          </div>

        </div>
      </div>

      <div class="row full-height">
        <div class="col-12">
          <div class="content-box">
            <div class="search-results">
              <div id="{{codeScheme.idIdentifier + '_code_scheme_link'}}"
                   class="search-result"
                   *ngFor="let codeScheme of searchResults$ | async; let last = last"
                   (click)="select(codeScheme)">
                <div class="content" [class.last]="last">
                  <span class="title" [innerHTML]="codeScheme.getDisplayName(languageService, useUILanguage)"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-footer">

      <button id="cancel_modal_button"
              type="button"
              class="btn btn-link cancel"
              (click)="cancel()" translate>Cancel</button>
    </div>
  `
})
export class SearchLinkedCodeSchemeModalComponent implements AfterViewInit, OnInit {

  @ViewChild('searchInput') searchInput: ElementRef;

  @Input() restricts: string[];
  @Input() titleLabel: string;
  @Input() searchLabel: string;
  @Input() useUILanguage: boolean;

  codeSchemes$: Observable<CodeScheme[]>;
  searchResults$: Observable<CodeScheme[]>;

  search$ = new BehaviorSubject('');
  loading = false;

  constructor(public modal: NgbActiveModal,
              public languageService: LanguageService,
              private dataService: DataService,
              private renderer: Renderer) {
  }

  ngOnInit() {
    const initialSearch = this.search$.pipe(take(1));
    const debouncedSearch = this.search$.pipe(skip(1), debounceTime(500));

    this.codeSchemes$ = this.dataService.searchCodeSchemes(null, null, null, null, false, this.languageService.language);

    this.searchResults$ = combineLatest(this.codeSchemes$, concat(initialSearch, debouncedSearch))
      .pipe(
        tap(() => this.loading = false),
        map(([codeSchemes, search]) => {
          return codeSchemes.filter(codeScheme => {
            const label = this.languageService.translate(codeScheme.prefLabel, true);
            const searchMatches = !search || label.toLowerCase().indexOf(search.toLowerCase()) !== -1;
            const isNotRestricted = !contains(this.restricts, codeScheme.id);
            return searchMatches && isNotRestricted;
          });
        })
      );
  }

  select(codeScheme: CodeScheme) {
    this.modal.close(codeScheme);
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
}

@Injectable()
export class SearchLinkedCodeSchemeModalService {

  constructor(private modalService: ModalService) {
  }

  open(titleLabel: string,
       searchLabel: string,
       restrictCodeIds: string[],
       useUILanguage: boolean = false): Promise<CodeScheme> {

    const modalRef = this.modalService.open(SearchLinkedCodeSchemeModalComponent, { size: 'sm' });
    const instance = modalRef.componentInstance as SearchLinkedCodeSchemeModalComponent;
    instance.titleLabel = titleLabel;
    instance.searchLabel = searchLabel;
    instance.restricts = restrictCodeIds;
    instance.useUILanguage = useUILanguage;
    return modalRef.result;
  }
}
