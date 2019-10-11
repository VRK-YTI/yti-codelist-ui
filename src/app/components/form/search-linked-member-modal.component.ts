import { AfterViewInit, Component, ElementRef, Injectable, Input, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, combineLatest, concat, Observable } from 'rxjs';
import { LanguageService } from '../../services/language.service';
import { contains } from 'yti-common-ui/utils/array';
import { ModalService } from '../../services/modal.service';
import { Member } from '../../entities/member';
import { TranslateService } from '@ngx-translate/core';
import { debounceTime, map, skip, take, tap } from 'rxjs/operators';
import { CodeScheme } from '../../entities/code-scheme';
import { Code } from '../../entities/code';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-search-linked-member-modal',
  styleUrls: ['./search-linked-member-modal.component.scss'],
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
                  <span translate *ngIf="!selectedCodeScheme">Filter results</span>
                  <span *ngIf="selectedCodeScheme">{{selectedCodeScheme.getLongDisplayName(languageService, false)}}</span>
                </button>
                <div ngbDropdownMenu aria-labelledby="code_scheme_dropdown_button">
                  <button id="codescheme_allcodeschemes_dropdown_button"
                          (click)="deSelectCodeScheme()"
                          class="dropdown-item"
                          [class.active]="selectedCodeScheme === null">
                    <span translate>All codeschemes</span>
                  </button>
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
            <input #searchInput id="search_linked_member_input"
                   type="text" class="form-control"
                   [placeholder]="searchLabel"
                   [(ngModel)]="search"/>
          </div>

        </div>
      </div>

      <div class="row full-height">
        <div class="col-12">
          <div class="content-box">
            <div class="search-results" *ngIf="searchResults$ | async as results">
              <div class="search-result"
                   *ngFor="let member of results; let last = last"
                   (click)="select(member)">
                <div class="content" [class.last]="last">
                  <span class="title"
                        [innerHTML]="member.getDisplayName(languageService, translateService, useUILanguage)">
                  </span>
                </div>
              </div>
              <div *ngIf="results.length === 0">
                <div>
                  <div class="no-results content last"><span translate>No search results</span></div>
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
export class SearchLinkedMemberModalComponent implements AfterViewInit, OnInit {

  @ViewChild('searchInput') searchInput: ElementRef;

  @Input() restricts: string[];
  @Input() titleLabel: string;
  @Input() searchLabel: string;
  @Input() codes$: Observable<Code[]>;
  @Input() codeSchemes: CodeScheme[];
  @Input() members$: Observable<Member[]>;
  @Input() useUILanguage: boolean;

  selectedCodeScheme: CodeScheme | null;
  searchResults$: Observable<Member[]>;
  search$ = new BehaviorSubject('');
  loading = false;

  constructor(public modal: NgbActiveModal,
              public languageService: LanguageService,
              public translateService: TranslateService,
              public dataService: DataService) {
  }

  ngOnInit() {

    const initialSearch = this.search$.pipe(take(1));
    const debouncedSearch = this.search$.pipe(skip(1), debounceTime(500));

    this.searchResults$ = combineLatest(this.members$, concat(initialSearch, debouncedSearch))
      .pipe(
        tap(() => this.loading = false),
        map(([members, search]) => {
          return members.filter(member => {
            const label = member.getDisplayName(this.languageService, this.translateService, this.useUILanguage);
            const searchMatches = !search || label.toLowerCase().indexOf(search.toLowerCase()) !== -1;
            const isNotRestricted = !contains(this.restricts, member.id);
            return searchMatches && isNotRestricted;
          });
        })
      );
  }

  select(member: Member) {
    this.modal.close(member);
  }

  ngAfterViewInit() {
    this.searchInput.nativeElement.focus();
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
    this.updateMembers();
  }

  deSelectCodeScheme(codeScheme: CodeScheme) {
    this.selectedCodeScheme = null;
    this.updateMembers();
  }

  filterMembers() {
    const initialSearch = this.search$.pipe(take(1));
    const debouncedSearch = this.search$.pipe(skip(1), debounceTime(500));

    if (this.selectedCodeScheme) {
      const codeValueOfSelectedCodeScheme = this.selectedCodeScheme.codeValue;

      this.searchResults$ = combineLatest(this.members$, concat(initialSearch, debouncedSearch), codeValueOfSelectedCodeScheme)
        .pipe(
          tap(() => this.loading = false),
          map(([members, search]) => {
            return members.filter(member => {
              const label = member.getDisplayName(this.languageService, this.translateService, this.useUILanguage);
              const codeValueOfTheCodeSchemeOfTheCodeOfTheCurrentMember = member.code.codeScheme.codeValue;
              const searchMatches = !search || label.toLowerCase().indexOf(search.toLowerCase()) !== -1;
              const codeSchemeMatches = codeValueOfTheCodeSchemeOfTheCodeOfTheCurrentMember === codeValueOfSelectedCodeScheme;
              const isNotRestricted = !contains(this.restricts, member.id);
              return searchMatches && isNotRestricted && codeSchemeMatches;
            });
          })
        );
    } else {
      this.searchResults$ = combineLatest(this.members$, concat(initialSearch, debouncedSearch))
        .pipe(
          tap(() => this.loading = false),
          map(([members, search]) => {
            return members.filter(member => {
              const label = member.getDisplayName(this.languageService, this.translateService, this.useUILanguage);
              const codeValueOfTheCodeSchemeOfTheCodeOfTheCurrentMember = member.code.codeScheme.codeValue;
              const searchMatches = !search || label.toLowerCase().indexOf(search.toLowerCase()) !== -1;
              const isNotRestricted = !contains(this.restricts, member.id);
              return searchMatches && isNotRestricted;
            });
          })
        );
    }


  }

  updateMembers() {
    this.filterMembers();
  }

}

@Injectable()
export class SearchLinkedMemberModalService {

  constructor(private modalService: ModalService) {
  }

  open(members$: Observable<Member[]>,
       titleLabel: string,
       searchLabel: string,
       codeSchemes: CodeScheme[],
       restrictedMemberIds: string[],
       useUILanguage: boolean = false): Promise<Member> {
    const modalRef = this.modalService.open(SearchLinkedMemberModalComponent, { size: 'sm', backdrop: 'static', keyboard: false });
    const instance = modalRef.componentInstance as SearchLinkedMemberModalComponent;
    instance.members$ = members$;
    instance.titleLabel = titleLabel;
    instance.searchLabel = searchLabel;
    instance.codeSchemes = codeSchemes;
    instance.restricts = restrictedMemberIds;
    instance.useUILanguage = useUILanguage;
    return modalRef.result;
  }
}
