import { AfterViewInit, Component, ElementRef, Injectable, Input, Renderer, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, Observable } from 'rxjs';
import { LanguageService } from '../../services/language.service';
import { contains } from 'yti-common-ui/utils/array';
import { ModalService } from '../../services/modal.service';
import { Code } from '../../entities/code';
import { DataService } from '../../services/data.service';

@Injectable()
export class SearchClassificationModalService {

  constructor(private modalService: ModalService) {
  }

  open(restrictClassificationIds: string[]): Promise<Code> {
    const modalRef = this.modalService.open(SearchClassificationModalComponent, { size: 'sm' });
    const instance = modalRef.componentInstance as SearchClassificationModalComponent;
    instance.restricts = restrictClassificationIds;
    return modalRef.result;
  }
}

@Component({
  selector: 'app-search-classification-modal',
  styleUrls: ['./search-classification-modal.component.scss'],
  template: `
    <div class="modal-header">
      <h4 class="modal-title">
        <a><i class="fa fa-times" (click)="cancel()"></i></a>
        <span translate>Choose classification</span>
      </h4>
    </div>
    <div class="modal-body full-height">

      <div class="row mb-2">
        <div class="col-12">

          <div class="input-group input-group-lg input-group-search">
            <input #searchInput type="text" class="form-control" placeholder="{{'Search classification' | translate}}"
                   [(ngModel)]="search"/>
          </div>

        </div>
      </div>

      <div class="row full-height">
        <div class="col-12">
          <div class="content-box">
            <div class="search-results">
              <div class="search-result"
                   *ngFor="let classification of searchResults$ | async; let last = last"
                   (click)="select(classification)">
                <div class="content" [class.last]="last">
                  <span class="title" [innerHTML]="classification.prefLabel | translateValue:true"></span>
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
export class SearchClassificationModalComponent implements AfterViewInit {

  @ViewChild('searchInput') searchInput: ElementRef;

  @Input() restricts: string[];

  searchResults$: Observable<Code[]>;

  search$ = new BehaviorSubject('');
  loading = false;

  constructor(public modal: NgbActiveModal,
              dataService: DataService,
              languageService: LanguageService,
              private renderer: Renderer) {

    const initialSearch = this.search$.take(1);
    const debouncedSearch = this.search$.skip(1).debounceTime(500);

    this.searchResults$ = Observable.combineLatest(dataService.getDataClassificationsAsCodes(), initialSearch.concat(debouncedSearch))
      .do(() => this.loading = false)
      .map(([classifications, search]) => {
        return classifications.filter(classification => {
          const label = languageService.translate(classification.prefLabel, true);
          const searchMatches = !search || label.toLowerCase().indexOf(search.toLowerCase()) !== -1;
          const isNotRestricted = !contains(this.restricts, classification.id);
          return searchMatches && isNotRestricted;
        });
      });
  }

  select(classification: Code) {
    this.modal.close(classification);
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
