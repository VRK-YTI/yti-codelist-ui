import { AfterViewInit, Component, ElementRef, Injectable, Input, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, combineLatest, concat, Observable } from 'rxjs';
import { LanguageService } from '../../services/language.service';
import { contains } from 'yti-common-ui/utils/array';
import { ModalService } from '../../services/modal.service';
import { Member } from '../../entities/member';
import { TranslateService } from '@ngx-translate/core';
import { debounceTime, map, skip, take, tap } from 'rxjs/operators';

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
            <div class="search-results">
              <div class="search-result"
                   *ngFor="let member of searchResults$ | async; let last = last"
                   (click)="select(member)">
                <div class="content" [class.last]="last">                  
                  <span class="title"
                        [innerHTML]="member.getDisplayName(languageService, translateService, useUILanguage)">
                  </span>
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
  @Input() members$: Observable<Member[]>;
  @Input() useUILanguage: boolean;

  searchResults$: Observable<Member[]>;

  search$ = new BehaviorSubject('');
  loading = false;

  constructor(public modal: NgbActiveModal,
              public languageService: LanguageService,
              public translateService: TranslateService) {
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
}

@Injectable()
export class SearchLinkedMemberModalService {

  constructor(private modalService: ModalService) {
  }

  open(members$: Observable<Member[]>,
       titleLabel: string,
       searchLabel: string,
       restrictedMemberIds: string[],
       useUILanguage: boolean = false): Promise<Member> {

    const modalRef = this.modalService.open(SearchLinkedMemberModalComponent, { size: 'sm' });
    const instance = modalRef.componentInstance as SearchLinkedMemberModalComponent;
    instance.members$ = members$;
    instance.titleLabel = titleLabel;
    instance.searchLabel = searchLabel;
    instance.restricts = restrictedMemberIds;
    instance.useUILanguage = useUILanguage;
    return modalRef.result;
  }
}
