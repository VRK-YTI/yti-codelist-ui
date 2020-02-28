import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChange, SimpleChanges, ViewChild } from '@angular/core';
import { CodeScheme } from '../../entities/code-scheme';
import { contains } from 'yti-common-ui/utils/array';
import { localizableMatches } from 'yti-common-ui/utils/localization';
import { CodePlain } from '../../entities/code-simple';
import { BehaviorSubject, combineLatest, Subscription } from 'rxjs';
import { VirtualScrollerComponent } from 'ngx-virtual-scroller';

@Component({
  selector: 'app-code-scheme-codes',
  templateUrl: './code-scheme-codes.component.html',
  styleUrls: ['./code-scheme-codes.component.scss']
})
export class CodeSchemeCodesComponent implements OnInit, OnDestroy, OnChanges {

  @Input() codes: CodePlain[];
  @Input() codeScheme: CodeScheme;
  @Input() prefilledSearchTermForCode: string;
  @ViewChild('scroll') virtualScroller: VirtualScrollerComponent;

  listedCodes: CodePlain[] = [];
  codeCount: number = 0;

  private parentCodes: CodePlain[] = [];
  private hasHierarchy: boolean = false;

  private sourceCodes: BehaviorSubject<CodePlain[]> = new BehaviorSubject<CodePlain[]>([]);
  private searchTerm_: BehaviorSubject<string> = new BehaviorSubject<string>("");
  private subscriptions: Subscription[] = [];


  constructor() {
  }

  ngOnInit(): void {
    this.subscriptions.push(combineLatest(this.searchTerm_, this.sourceCodes).subscribe(([term, codes]) => {
      if (term) {
        this.listedCodes = codes.filter(code => code.codeValue.toLowerCase().includes(term.toLowerCase()) || localizableMatches(code.prefLabel, term));
        this.parentCodes = [];
        this.codeCount = this.listedCodes.length;
      } else {
        const parentIds: { [id: string]: boolean } = {};
        codes.forEach(code => {
          if (code.broaderCode) {
            parentIds[code.broaderCode.id] = true;
          }
        });
        this.listedCodes = codes.filter(code => !code.broaderCode);
        this.parentCodes = codes.filter(code => parentIds[code.id]);
        this.codeCount = codes.length;
      }
      this.hasHierarchy = !!this.parentCodes.length;
    }));
  }

  get emptySearch(): boolean {
    return this.searchTermHasValue && this.listedCodes.length === 0;
  }

  get searchTermHasValue(): boolean {
    return !!this.searchTerm_.getValue();
  }

  get searchTerm(): string {
    return this.searchTerm_.getValue();
  }

  set searchTerm(value: string) {
    this.searchTerm_.next(value);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  ngOnChanges(changes: SimpleChanges) {
    const prefilledSearchTermForCode: SimpleChange = changes.prefilledSearchTermForCode;
    if (prefilledSearchTermForCode && prefilledSearchTermForCode.currentValue) {
      this.searchTerm_.next(prefilledSearchTermForCode.currentValue);
    }
    const codesChange: SimpleChange = changes.codes;
    if (codesChange) {
      this.sourceCodes.next(codesChange.currentValue ? codesChange.currentValue : []);
    }
  }

  expandAll() {
    this.codes.forEach(code => {
      if (contains(this.parentCodes, code)) {
        code.expanded = true;
      }
    });
  }

  collapseAll() {
    this.codes.forEach(code => {
      if (contains(this.parentCodes, code)) {
        code.expanded = false;
      }
    });
  }

  showExpandAll() {
    return !this.searchTermHasValue && !!this.parentCodes.find(code => !code.expanded);
  }

  showCollapseAll() {
    return !this.searchTermHasValue && !!this.parentCodes.find(code => code.expanded);
  }

  allowExpandAllAndCollapseAll() {
    return this.sourceCodes.getValue().length <= 500 && this.hasHierarchy;
  }

  codeIdentity(index: number, item: CodePlain) {
    return item.id;
  }

  getIdIdentifier(code: CodePlain) {
    return `${this.codeScheme.codeRegistry.codeValue}_${this.codeScheme.codeValue}_${code.codeValue}`;
  }

  onItemResize(event: { code: CodePlain, expanded: boolean }) {
    let code: CodePlain | undefined = event.code;
    while (code && code.broaderCode) {
      const parentId: string = code.broaderCode.id;
      code = this.parentCodes.find(p => p.id === parentId);
    }
    if (code) {
      this.virtualScroller.invalidateCachedMeasurementForItem(code);
    } else {
      console.error('Could not find root code for collapsed or expanded code');
    }
  }
}
