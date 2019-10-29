import { AfterViewInit, Component, ElementRef, Injectable, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, combineLatest, concat, Observable, Subscription } from 'rxjs';
import { debounceTime, map, skip, take, tap } from 'rxjs/operators';
import { LanguageService } from '../../services/language.service';
import { contains } from 'yti-common-ui/utils/array';
import { ModalService } from '../../services/modal.service';
import { Code } from '../../entities/code';
import { CodeScheme } from '../../entities/code-scheme';
import { DataService } from '../../services/data.service';
import { selectableStatuses, Status } from 'yti-common-ui/entities/status';
import { FilterOptions } from 'yti-common-ui/components/filter-dropdown.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-search-linked-code-modal',
  styleUrls: ['./search-linked-code-modal.component.scss'],
  template: `
      <div class="modal-header">
          <h4 class="modal-title">
              <a><i id="close_modal_link" class="fa fa-times" (click)="cancel()"></i></a>
              <span>{{titleLabel}}</span>
          </h4>
      </div>
      <div class="modal-body full-height">
          <div *ngIf="codeSchemes != null && codeSchemes.length > 1" class="row mb-2">
              <div class="col-12">
                  <div ngbDropdown class="d-inline-block">
                      <dl>
                          <dt>
                              <label for="code_scheme_dropdown_button" translate>Code list</label>
                          </dt>
                          <dd>
                              <button class="btn btn-dropdown" id="code_scheme_dropdown_button" ngbDropdownToggle>
                                  <span>{{selectedCodeScheme.getLongDisplayName(languageService, false)}}</span>
                              </button>
                              <div ngbDropdownMenu aria-labelledby="code_scheme_dropdown_button">
                                  <div *ngFor="let codeScheme of codeSchemes">
                                      <button id="codescheme_{{codeScheme.id}}_dropdown_button"
                                              (click)="selectCodeScheme(codeScheme)"
                                              class="dropdown-item"
                                              [class.active]="selectedCodeScheme === codeScheme">
                                          {{codeScheme.getLongDisplayName(languageService, false)}}</button>
                                  </div>
                              </div>
                          </dd>
                      </dl>
                  </div>
              </div>
          </div>

          <div class="row mb-2">
              <div class="col">
                  <div class="input-group input-group-lg input-group-search">
                      <input #searchInput id="search_linked_code_input" type="text" class="form-control" style="width: 75%"
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
                          <div id="{{code.idIdentifier + '_code_link'}}"
                               class="search-result"
                               *ngFor="let code of searchResults; let last = last"
                               (click)="select(code)">
                              <div class="content" [class.last]="last">
                                  <span class="title" [innerHTML]="code.codeValue + ' - ' + code.getDisplayName(languageService, useUILanguage)"></span>
                                  <app-status class="status" [status]="code.status"></app-status>
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
export class SearchLinkedCodeModalComponent implements AfterViewInit, OnInit, OnDestroy {

  @ViewChild('searchInput') searchInput: ElementRef;

  @Input() restricts: string[];
  @Input() titleLabel: string;
  @Input() searchLabel: string;
  @Input() codes$: Observable<Code[]>;
  @Input() codeSchemes: CodeScheme[];
  @Input() useUILanguage: boolean;

  searchResults$: Observable<Code[]>;
  selectedCodeScheme: CodeScheme;
  statusOptions: FilterOptions<Status>;

  search$ = new BehaviorSubject('');
  status$ = new BehaviorSubject<Status | null>(null);
  loading = true;
  searchResults: Code[] = [];
  private subscriptionsToClean: Subscription[] = [];

  constructor(public modal: NgbActiveModal,
              public languageService: LanguageService,
              public translateService: TranslateService,
              private dataService: DataService) {
  }

  ngOnInit() {
    if (!this.codes$) {
      this.selectedCodeScheme = this.codeSchemes[0];
      this.updateCodes();
    } else {
      this.filterCodes();
    }

    this.statusOptions = [null, ...selectableStatuses].map(status => ({
      value: status,
      name: () => this.translateService.instant(status ? status : 'All statuses'),
      idIdentifier: () => status ? status : 'all_selected'
    }));

  }

  select(code: Code) {
    this.modal.close(code);
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

  selectCodeScheme(codeScheme: CodeScheme) {
    this.selectedCodeScheme = codeScheme;
    this.updateCodes();
  }

  filterCodes() {
    const initialSearch = this.search$.pipe(take(1));
    const debouncedSearch = this.search$.pipe(skip(1), debounceTime(500));

    function statusMatches(status: Status | null, code: Code) {
      return !status || code.status === status;
    }

    this.searchResults$ = combineLatest(this.codes$, concat(initialSearch, debouncedSearch), this.status$)
      .pipe(
        tap(() => this.loading = false),
        map(([codes, search, theStatus]) => {
          return codes.filter(code => {
            const label = this.languageService.translate(code.prefLabel, true);
            const searchMatches = !search || label.toLowerCase().indexOf(search.toLowerCase()) !== -1;
            const theStatusMatches = statusMatches(theStatus, code);
            const isNotRestricted = !contains(this.restricts, code.id);
            return searchMatches && isNotRestricted && theStatusMatches;
          });
        })
      );

    this.subscriptionsToClean.push(this.searchResults$.subscribe(codeSchemes => {
      this.searchResults = codeSchemes;
    }));
  }

  updateCodes() {
    this.loading = true;
    this.codes$ = this.dataService.getCodes(
      this.selectedCodeScheme.codeRegistry.codeValue,
      this.selectedCodeScheme.codeValue,
      this.languageService.language);
    this.filterCodes();
  }
}

@Injectable()
export class SearchLinkedCodeModalService {

  constructor(private modalService: ModalService) {
  }

  openWithCodes(codes$: Observable<Code[]>,
                titleLabel: string,
                searchLabel: string,
                restrictCodeIds: string[],
                useUILanguage: boolean = false): Promise<Code> {

    const modalRef = this.modalService.open(SearchLinkedCodeModalComponent, { size: 'sm', backdrop: 'static', keyboard: false });
    const instance = modalRef.componentInstance as SearchLinkedCodeModalComponent;
    instance.codes$ = codes$;
    instance.titleLabel = titleLabel;
    instance.searchLabel = searchLabel;
    instance.restricts = restrictCodeIds;
    instance.useUILanguage = useUILanguage;
    return modalRef.result;
  }

  openWithCodeSchemes(codeSchemes: CodeScheme[],
                      titleLabel: string,
                      searchLabel: string,
                      restrictCodeIds: string[],
                      useUILanguage: boolean = false): Promise<Code> {

    const modalRef = this.modalService.open(SearchLinkedCodeModalComponent, { size: 'sm', backdrop: 'static', keyboard: false });
    const instance = modalRef.componentInstance as SearchLinkedCodeModalComponent;
    instance.codeSchemes = codeSchemes;
    instance.titleLabel = titleLabel;
    instance.searchLabel = searchLabel;
    instance.restricts = restrictCodeIds;
    instance.useUILanguage = useUILanguage;
    return modalRef.result;
  }
}
