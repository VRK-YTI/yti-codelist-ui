import {
  Component,
  ElementRef,
  Injectable,
  ViewChild,
  AfterViewInit
} from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DataService } from '../../services/data.service';
import { LanguageService } from '../../services/language.service';
import { ModalService} from '../../services/modal.service';
import { OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable, BehaviorSubject, concat } from 'rxjs';
import { debounceTime, skip, take } from 'rxjs/operators';
import { CodeScheme } from '../../entities/code-scheme';
import { CodeListErrorModalService } from '../common/error-modal.service';
import {anyMatching} from "yti-common-ui/utils/array";

function debounceSearch(search$: Observable<string>): Observable<string> {
  const initialSearch = search$.pipe(take(1));
  const debouncedSearch = search$.pipe(skip(1), debounceTime(500));
  return concat(initialSearch, debouncedSearch);
}

@Injectable()
export class CodeschemeVariantModalService {

  constructor(private modalService: ModalService) {
  }

  public open(forbiddenVariantSearchResultIds: string[]): Promise<CodeScheme> {
    const modalRef = this.modalService.open(CodeschemeVariantModalComponent, {size: 'lg'});
    const instance = modalRef.componentInstance as CodeschemeVariantModalComponent;
    instance.forbiddenVariantSearchResultIds = forbiddenVariantSearchResultIds;
    return modalRef.result;
  }
}

@Component({
  selector: 'app-codescheme-variant-modal',
  templateUrl: './codescheme-variant.modal.component.html',
  styleUrls: ['./codescheme-variant.modal.component.scss']
})
export class CodeschemeVariantModalComponent implements OnInit, AfterViewInit {

  loading = false;

  @ViewChild('searchInput') searchInput: ElementRef;

  searchResults: CodeScheme[];
  search$ = new BehaviorSubject('');
  debouncedSearch$ = debounceSearch(this.search$);
  cancelText: string;
  forbiddenVariantSearchResultIds: string[] = [];

  constructor(private dataService: DataService,
              private modal: NgbActiveModal,
              public languageService: LanguageService,
              private translateService: TranslateService,
              private codeListErrorModalService: CodeListErrorModalService) {
  }

  ngOnInit() {
    this.debouncedSearch$.subscribe(search => {

        if (!search) {
          this.searchResults = [];
        } else {
          this.loading = true;
          this.dataService.searchCodeSchemes(search, null, null, null, false,  null).subscribe(codeSchemes => {
              this.loading = false;
              this.searchResults = codeSchemes.filter(cs =>
                !anyMatching(this.forbiddenVariantSearchResultIds, forbiddenId => cs.id === forbiddenId));
            },
            err => {
              this.loading = false;
              this.codeListErrorModalService.openSubmitError(err);
            });
        }
      });
  }

  ngAfterViewInit() {
    this.searchInput.nativeElement.focus();
  }

  hasSearchResults() {
    return this.searchResults.length > 0;
  }

  close() {
    this.modal.dismiss('cancel');
  }

  select(codeScheme: CodeScheme) {
    this.modal.close(codeScheme);
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
