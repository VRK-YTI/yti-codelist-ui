import { AfterViewInit, Component, ElementRef, Injectable, Input, OnInit, Renderer, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, combineLatest, concat, Observable } from 'rxjs';
import { debounceTime, map, skip, take, tap } from 'rxjs/operators';
import { LanguageService } from '../../services/language.service';
import { contains } from 'yti-common-ui/utils/array';
import { ModalService } from '../../services/modal.service';
import { Code } from '../../entities/code';
import { CodeScheme } from '../../entities/code-scheme';
import { DataService } from '../../services/data.service';

@Injectable()
export class SearchLinkedCodeModalService {

  constructor(private modalService: ModalService) {
  }

  openWithCodes(codes$: Observable<Code[]>,
                titleLabel: string,
                searchLabel: string,
                restrictCodeIds: string[],
                useUILanguage: boolean = false): Promise<Code> {

    const modalRef = this.modalService.open(SearchLinkedCodeModalComponent, { size: 'sm' });
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

    const modalRef = this.modalService.open(SearchLinkedCodeModalComponent, { size: 'sm' });
    const instance = modalRef.componentInstance as SearchLinkedCodeModalComponent;
    instance.codeSchemes = codeSchemes;
    instance.titleLabel = titleLabel;
    instance.searchLabel = searchLabel;
    instance.restricts = restrictCodeIds;
    instance.useUILanguage = useUILanguage;
    return modalRef.result;
  }
}

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
        <div class="col-12">
          <div class="input-group input-group-lg input-group-search">
            <input #searchInput id="search_linked_code_input" type="text" class="form-control"
                   [placeholder]="searchLabel"
                   [(ngModel)]="search"/>
          </div>
        </div>
      </div>

      <div class="row full-height">
        <div class="col-12">
          <div class="content-box">
            <div class="search-results">
              <div id="{{code.idIdentifier + '_code_link'}}"
                   class="search-result"
                   *ngFor="let code of searchResults$ | async; let last = last"
                   (click)="select(code)">
                <div class="content" [class.last]="last">
                  <span class="title" [innerHTML]="code.getDisplayName(languageService, useUILanguage)"></span>
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
export class SearchLinkedCodeModalComponent implements AfterViewInit, OnInit {

  @ViewChild('searchInput') searchInput: ElementRef;

  @Input() restricts: string[];
  @Input() titleLabel: string;
  @Input() searchLabel: string;
  @Input() codes$: Observable<Code[]>;
  @Input() codeSchemes: CodeScheme[];
  @Input() useUILanguage: boolean;

  searchResults$: Observable<Code[]>;
  selectedCodeScheme: CodeScheme;

  search$ = new BehaviorSubject('');
  loading = false;

  constructor(public modal: NgbActiveModal,
              public languageService: LanguageService,
              private dataService: DataService,
              private renderer: Renderer) {
  }

  ngOnInit() {
    if (!this.codes$) {
      this.selectedCodeScheme = this.codeSchemes[0];
      this.updateCodes();
    } else {
      this.filterCodes();
    }
  }

  select(code: Code) {
    this.modal.close(code);
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

  selectCodeScheme(codeScheme: CodeScheme) {
    this.selectedCodeScheme = codeScheme;
    this.updateCodes();
  }

  filterCodes() {
    const initialSearch = this.search$.pipe(take(1));
    const debouncedSearch = this.search$.pipe(skip(1), debounceTime(500));

    this.searchResults$ = combineLatest(this.codes$, concat(initialSearch, debouncedSearch))
      .pipe(
        tap(() => this.loading = false),
        map(([codes, search]) => {
          return codes.filter(code => {
            const label = this.languageService.translate(code.prefLabel, true);
            const searchMatches = !search || label.toLowerCase().indexOf(search.toLowerCase()) !== -1;
            const isNotRestricted = !contains(this.restricts, code.id);
            return searchMatches && isNotRestricted;
          });
        })
      );
  }

  updateCodes() {
    this.codes$ = this.dataService.getCodes(
      this.selectedCodeScheme.codeRegistry.codeValue,
      this.selectedCodeScheme.codeValue,
      this.languageService.language);
    this.filterCodes();
  }
}
