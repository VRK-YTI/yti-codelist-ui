import { AfterViewInit, Component, ElementRef, Injectable, Input, OnInit, Renderer, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, combineLatest, concat, Observable } from 'rxjs';
import { LanguageService } from '../../services/language.service';
import { contains } from 'yti-common-ui/utils/array';
import { ModalService } from '../../services/modal.service';
import { Extension } from '../../entities/extension';
import { TranslateService } from '@ngx-translate/core';
import { debounceTime, map, skip, take, tap } from 'rxjs/operators';

@Component({
  selector: 'app-search-linked-extension-modal',
  styleUrls: ['./search-linked-extension-modal.component.scss'],
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
            <input #searchInput id="search_linked_extension_input"
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
                   *ngFor="let extension of searchResults$ | async; let last = last"
                   (click)="select(extension)">
                <div class="content" [class.last]="last">                  
                  <span class="title"
                        [innerHTML]="extension.getDisplayName(languageService, translateService, useUILanguage)">
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
export class SearchLinkedExtensionModalComponent implements AfterViewInit, OnInit {

  @ViewChild('searchInput') searchInput: ElementRef;

  @Input() restricts: string[];
  @Input() titleLabel: string;
  @Input() searchLabel: string;
  @Input() extensions$: Observable<Extension[]>;
  @Input() useUILanguage: boolean;

  searchResults$: Observable<Extension[]>;

  search$ = new BehaviorSubject('');
  loading = false;

  constructor(public modal: NgbActiveModal,
              public languageService: LanguageService,
              public translateService: TranslateService,
              private renderer: Renderer) {
  }

  ngOnInit() {

    const initialSearch = this.search$.pipe(take(1));
    const debouncedSearch = this.search$.pipe(skip(1), debounceTime(500));

    this.searchResults$ = combineLatest(this.extensions$, concat(initialSearch, debouncedSearch))
      .pipe(
        tap(() => this.loading = false),
        map(([extensions, search]) => {
          return extensions.filter(extension => {
            const label = extension.getDisplayName(this.languageService, this.translateService);
            const searchMatches = !search || label.toLowerCase().indexOf(search.toLowerCase()) !== -1;
            const isNotRestricted = !contains(this.restricts, extension.id);
            return searchMatches && isNotRestricted;
          });
        })
      );
  }

  select(extension: Extension) {
    this.modal.close(extension);
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
export class SearchLinkedExtensionModalService {

  constructor(private modalService: ModalService) {
  }

  open(extensions$: Observable<Extension[]>,
       titleLabel: string,
       searchLabel: string,
       restrictExtensionIds: string[],
       useUILanguage: boolean = false): Promise<Extension> {

    const modalRef = this.modalService.open(SearchLinkedExtensionModalComponent, { size: 'sm' });
    const instance = modalRef.componentInstance as SearchLinkedExtensionModalComponent;
    instance.extensions$ = extensions$;
    instance.titleLabel = titleLabel;
    instance.searchLabel = searchLabel;
    instance.restricts = restrictExtensionIds;
    instance.useUILanguage = useUILanguage;
    return modalRef.result;
  }
}
