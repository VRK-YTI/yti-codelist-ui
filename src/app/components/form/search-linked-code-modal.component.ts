import { AfterViewInit, Component, ElementRef, Injectable, Input, Renderer, ViewChild, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, Observable } from 'rxjs';
import { LanguageService } from '../../services/language.service';
import { contains } from 'yti-common-ui/utils/array';
import { ModalService } from '../../services/modal.service';
import { Code } from '../../entities/code';

@Injectable()
export class SearchLinkedCodeModalService {

  constructor(private modalService: ModalService) {
  }

  open(codes$: Observable<Code[]>, titleLabel: string, searchLabel: string, restrictCodeIds: string[]): Promise<Code> {
    const modalRef = this.modalService.open(SearchLinkedCodeModalModalComponent, { size: 'sm' });
    const instance = modalRef.componentInstance as SearchLinkedCodeModalModalComponent;
    instance.codes$ = codes$;
    instance.titleLabel = titleLabel;
    instance.searchLabel = searchLabel;
    instance.restricts = restrictCodeIds;
    return modalRef.result;
  }
}

@Component({
  selector: 'app-search-linked-code-modal',
  styleUrls: ['./search-linked-code-modal.component.scss'],
  template: `
    <div class="modal-header">
      <h4 class="modal-title">
        <a><i class="fa fa-times" (click)="cancel()"></i></a>
        <span>{{titleLabel}}</span>
      </h4>
    </div>
    <div class="modal-body full-height">

      <div class="row mb-2">
        <div class="col-12">

          <div class="input-group input-group-lg input-group-search">
            <input #searchInput type="text" class="form-control" [placeholder]="searchLabel"
                   [(ngModel)]="search"/>
          </div>

        </div>
      </div>

      <div class="row full-height">
        <div class="col-12">
          <div class="content-box">
            <div class="search-results">
              <div class="search-result"
                   *ngFor="let code of searchResults$ | async; let last = last"
                   (click)="select(code)">
                <div class="content" [class.last]="last">
                  <span class="title" [innerHTML]="code.prefLabel | translateValue:true"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-footer">

      <button type="button"
              class="btn btn-link cancel"
              (click)="cancel()" translate>Cancel</button>
    </div>
  `
})
export class SearchLinkedCodeModalModalComponent implements AfterViewInit, OnInit {

  @ViewChild('searchInput') searchInput: ElementRef;

  @Input() restricts: string[];
  @Input() titleLabel: string;
  @Input() searchLabel: string;
  @Input() codes$: Observable<Code[]>;

  searchResults$: Observable<Code[]>;

  search$ = new BehaviorSubject('');
  loading = false;

  constructor(public modal: NgbActiveModal,
              private languageService: LanguageService,
              private renderer: Renderer) {
  }

  ngOnInit() {
    const initialSearch = this.search$.take(1);
    const debouncedSearch = this.search$.skip(1).debounceTime(500);

    this.searchResults$ = Observable.combineLatest(this.codes$, initialSearch.concat(debouncedSearch))
      .do(() => this.loading = false)
      .map(([codes, search]) => {
        return codes.filter(code => {
          const label = this.languageService.translate(code.prefLabel, true);
          const searchMatches = !search || label.toLowerCase().indexOf(search.toLowerCase()) !== -1;
          const isNotRestricted = !contains(this.restricts, code.id);
          return searchMatches && isNotRestricted;
        });
      });
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
}
