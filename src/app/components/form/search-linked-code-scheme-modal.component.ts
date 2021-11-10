import { AfterViewInit, Component, ElementRef, Injectable, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, combineLatest, concat, Observable, Subscription } from 'rxjs';
import { LanguageService } from '../../services/language.service';
import { CodeScheme } from '../../entities/code-scheme';
import { DataService } from '../../services/data.service';
import { debounceTime, map, skip, take, tap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { Code } from '../../entities/code';
import { contains, FilterOptions, ModalService, selectableStatuses, Status } from '@vrk-yti/yti-common-ui';

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
        <div class="col">

          <div class="input-group input-group-lg input-group-search">
            <input #searchInput id="search_linked_code-scheme_input" type="text" class="form-control"
                   [placeholder]="searchLabel"
                   [(ngModel)]="search"/>
          </div>

        </div>

        <div class="col">
          <app-filter-dropdown id="status_filter_dropdown"
                               [filterSubject]="status$"
                               [options]="statusOptions"
                               [placement]="'bottom-right'"
                               style="float: right;"></app-filter-dropdown>
        </div>

      </div>

      <div class="row full-height">
        <div class="col-12">
          <div class="content-box">
            <div class="search-results" *ngIf="searchResults.length > 0">
              <div id="{{codeScheme.idIdentifier + '_code_scheme_link'}}"
                   class="search-result"
                   *ngFor="let codeScheme of searchResults; let last = last"
                   (click)="select(codeScheme)">
                <div class="content row" [class.last]="last">
                  <div class="col-md-8 float-left">
                    <span class="title" [innerHTML]="codeScheme.getDisplayName(languageService, useUILanguage)"></span>
                  </div>
                  <div class="col-md-4 float-right">
                  <app-status class="status" [status]="codeScheme.status"></app-status>
                  </div>
                </div>
              </div>
            </div>
            <div class="search-results" *ngIf="this.searchResults.length === 0 && loading">
                <app-ajax-loading-indicator></app-ajax-loading-indicator>
            </div>
            <div class="search-results" *ngIf="this.searchResults.length === 0 && !loading">
              <p translate class="no-results content last">No search results</p>
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
export class SearchLinkedCodeSchemeModalComponent implements AfterViewInit, OnInit, OnDestroy {

  @ViewChild('searchInput') searchInput: ElementRef;

  @Input() restricts: string[];
  @Input() titleLabel: string;
  @Input() searchLabel: string;
  @Input() useUILanguage: boolean;

  codeSchemes$: Observable<CodeScheme[]>;
  searchResults$: Observable<CodeScheme[]>;
  statusOptions: FilterOptions<Status>;

  search$ = new BehaviorSubject('');
  status$ = new BehaviorSubject<Status | null>(null);
  loading = true;
  searchResults: CodeScheme[] = [];
  private subscriptionsToClean: Subscription[] = [];

  constructor(public modal: NgbActiveModal,
              public languageService: LanguageService,
              public translateService: TranslateService,
              private dataService: DataService) {
  }

  ngOnInit() {
    const initialSearch = this.search$.pipe(take(1));
    const debouncedSearch = this.search$.pipe(skip(1), debounceTime(500));

    this.codeSchemes$ = this.dataService.searchCodeSchemes(null, null, null, null, null, false, false, this.languageService.language);

    this.statusOptions = [null, ...selectableStatuses].map(status => ({
      value: status,
      name: () => this.translateService.instant(status ? status : 'All statuses'),
      idIdentifier: () => status ? status : 'all_selected'
    }));

    function statusMatches(status: Status | null, codeScheme: CodeScheme) {
      return !status || codeScheme.status === status;
    }

    this.searchResults$ = combineLatest(this.codeSchemes$, concat(initialSearch, debouncedSearch), this.status$)
      .pipe(
        tap(() => this.loading = false),
        map(([codeSchemes, search, theStatus]) => {
          return codeSchemes.filter(codeScheme => {
            const label = this.languageService.translate(codeScheme.prefLabel, true);
            const searchMatches = !search || label.toLowerCase().indexOf(search.toLowerCase()) !== -1;
            const theStatusMatches = statusMatches(theStatus, codeScheme);
            const isNotRestricted = !contains(this.restricts, codeScheme.id);
            return searchMatches && isNotRestricted && theStatusMatches;
          });
        })
      );

    this.subscriptionsToClean.push(this.searchResults$.subscribe(codeSchemes => {
      this.searchResults = codeSchemes;
    }));
  }

  select(codeScheme: CodeScheme) {
    this.modal.close(codeScheme);
  }

  ngAfterViewInit() {
    this.searchInput.nativeElement.focus();
  }

  ngOnDestroy() {
    this.subscriptionsToClean.forEach(s => s.unsubscribe());
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

    const modalRef = this.modalService.open(SearchLinkedCodeSchemeModalComponent, { size: 'sm', backdrop: 'static', keyboard: false });
    const instance = modalRef.componentInstance as SearchLinkedCodeSchemeModalComponent;
    instance.titleLabel = titleLabel;
    instance.searchLabel = searchLabel;
    instance.restricts = restrictCodeIds;
    instance.useUILanguage = useUILanguage;
    return modalRef.result;
  }
}
