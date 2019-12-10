import { AfterViewInit, Component, ElementRef, Injectable, Input, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, combineLatest, concat, Observable } from 'rxjs';
import { LanguageService } from '../../services/language.service';
import { contains } from 'yti-common-ui/utils/array';
import { ModalService } from 'yti-common-ui/services/modal.service';
import { Organization } from '../../entities/organization';
import { debounceTime, map, skip, take, tap } from 'rxjs/operators';
import { comparingLocalizable } from 'yti-common-ui/utils/comparator';

@Component({
  selector: 'app-search-linked-organizatione-modal',
  styleUrls: ['./search-linked-organization-modal.component.scss'],
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
            <input #searchInput id="search_linked_organization_input" type="text" class="form-control"
                   [placeholder]="searchLabel"
                   [(ngModel)]="search"/>
          </div>
        </div>
      </div>

      <div class="row full-height">
        <div class="col-12">
          <div class="content-box">
            <div class="search-results">
              <div [id]="organization.getIdIdentifier(languageService) + '_organization_link'"
                   class="search-result"
                   *ngFor="let organization of searchResults$ | async; let last = last"
                   (click)="select(organization)">
                <div class="content" [class.last]="last">
                  <span class="title" [innerHTML]="organization.getDisplayName(languageService, useUILanguage)"></span>
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
export class SearchLinkedOrganizationModalComponent implements AfterViewInit, OnInit {

  @ViewChild('searchInput') searchInput: ElementRef;

  @Input() restricts: string[];
  @Input() titleLabel: string;
  @Input() searchLabel: string;
  @Input() organizations$: Observable<Organization[]>;
  @Input() useUILanguage: boolean;

  searchResults$: Observable<Organization[]>;

  search$ = new BehaviorSubject('');
  loading = false;

  constructor(public modal: NgbActiveModal,
              public languageService: LanguageService) {
  }

  ngOnInit() {
    const initialSearch = this.search$.pipe(take(1));
    const debouncedSearch = this.search$.pipe(skip(1), debounceTime(500));

    this.searchResults$ = combineLatest(this.organizations$, concat(initialSearch, debouncedSearch))
      .pipe(
        tap(() => this.loading = false),
        map(([organizations, search]) => {
          return organizations.filter(organization => {
            const label = this.languageService.translate(organization.prefLabel, true);
            const searchMatches = !search || label.toLowerCase().indexOf(search.toLowerCase()) !== -1;
            const isNotRestricted = !contains(this.restricts, organization.id);
            return searchMatches && isNotRestricted;
          }).sort(comparingLocalizable<Organization>(this.languageService, organization => organization.prefLabel ? organization.prefLabel : {}));
        })
      );
  }

  select(organization: Organization) {
    this.modal.close(organization);
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
export class SearchLinkedOrganizationModalService {

  constructor(private modalService: ModalService) {
  }

  open(organizations$: Observable<Organization[]>,
       titleLabel: string,
       searchLabel: string,
       restrictOrganizationIds: string[],
       useUILanguage: boolean = false): Promise<Organization> {

    const modalRef = this.modalService.open(SearchLinkedOrganizationModalComponent, { size: 'sm', backdrop: 'static', keyboard: false });
    const instance = modalRef.componentInstance as SearchLinkedOrganizationModalComponent;
    instance.organizations$ = organizations$;
    instance.titleLabel = titleLabel;
    instance.searchLabel = searchLabel;
    instance.restricts = restrictOrganizationIds;
    instance.useUILanguage = useUILanguage;
    return modalRef.result;
  }
}
