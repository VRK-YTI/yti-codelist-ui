import {
  Component,
  ElementRef,
  Injectable,
  ViewChild,
  Input, AfterViewInit
} from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DataService } from '../../services/data.service';
import { Vocabulary } from '../../entities/vocabulary';
import { LanguageService } from '../../services/language.service';
import { ModalService} from '../../services/modal.service';
import { OnInit } from '@angular/core';
import { FilterOptions } from 'yti-common-ui/components/filter-dropdown.component';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { TranslateService } from 'ng2-translate';
import { Observable } from 'rxjs/Rx';
import { CodeScheme } from '../../entities/code-scheme';
import { CodeListErrorModalService } from '../common/error-modal.service';

function debounceSearch(search$: Observable<string>): Observable<string> {
  const initialSearch = search$.take(1);
  const debouncedSearch = search$.skip(1).debounceTime(500);
  return initialSearch.concat(debouncedSearch);
}

@Injectable()
export class CodeschemeVariantModalService {

  constructor(private modalService: ModalService) {
  }

  public open(): Promise<CodeScheme> {
    const modalRef = this.modalService.open(CodeschemeVariantModalComponent, {size: 'lg'});
    const instance = modalRef.componentInstance as CodeschemeVariantModalComponent;
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
  variantModalPageTitle: string;
  variantModalInstructionText: string;

  constructor(private dataService: DataService,
              private modal: NgbActiveModal,
              public languageService: LanguageService,
              private translateService: TranslateService,
              private codeListErrorModalService: CodeListErrorModalService) {
  }

  ngOnInit() {
    Observable.combineLatest(this.debouncedSearch$)
      .subscribe(([search]) => {

        if (!search) {
          this.searchResults = [];
        } else {
          this.loading = true;
          this.dataService.searchCodeSchemes(search, null, null, null, false,  null).subscribe(codeSchemes => {
              this.loading = false;
              this.searchResults = codeSchemes;
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
