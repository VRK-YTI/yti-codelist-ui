import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CodePlain } from '../../entities/code-simple';
import { CodeScheme } from '../../entities/code-scheme';

@Component({
  selector: 'app-hierarchy-code',
  styleUrls: ['./hierarchy-code.component.scss'],
  template: `
    <i id="hierarchy_code_expand" [hidden]="!hasChildren() || expanded" class="icon fa fa-plus" (click)="expand()"></i>
    <i id="hierarchy_code_collapse" [hidden]="!hasChildren() || collapsed" class="icon fa fa-minus"
       (click)="collapse()"></i>
    <i id="hierarchy_code_aligner" [hidden]="hasChildren()" class="icon fa"></i>

    <div id="{{getIdIdentifier(code) + '_view_code'}}" class="code" (click)="viewCode(code)">
      <app-status class="float-right status" [status]="code.status"></app-status>
      <span *ngIf="code.hasPrefLabel()" class="codetitle">{{code.codeValue}} - {{code.prefLabel | translateValue}}</span>
      <span *ngIf="!code.hasPrefLabel()" class="codetitle">{{code.codeValue}}</span>
    </div>

    <ul *ngIf="expanded && hasChildren()">
      <li class="child-code" *ngFor="let code of children; trackBy: codeIdentity">
        <app-hierarchy-code id="{{getIdIdentifier(code) + '_codelist_childcode_listitem'}}"
                            [codes]="codes"
                            [code]="code"
                            [codeScheme]="codeScheme"
                            [ignoreHierarchy]="ignoreHierarchy"
                            [expandCollapseListener]="expandCollapseListener"></app-hierarchy-code>
      </li>
    </ul>
  `
})

export class HierarchyCodeComponent {

  @Input() codes: CodePlain[];
  @Input() code: CodePlain;
  @Input() codeScheme: CodeScheme;
  @Input() ignoreHierarchy: boolean;
  @Input() expandCollapseListener?: (code: CodePlain) => void;

  constructor(private router: Router) {
  }

  get children() {
    return this.codes.filter(code => code.broaderCode != null && code.broaderCode.id === this.code.id);
  }

  get expanded() {
    return this.code.expanded;
  }

  get collapsed() {
    return !this.expanded;
  }

  expand() {
    this.code.expanded = true;
    if (this.expandCollapseListener) {
      this.expandCollapseListener(this.code);
    }
  }

  collapse() {
    this.code.expanded = false;
    if (this.expandCollapseListener) {
      this.expandCollapseListener(this.code);
    }
  }

  hasChildren() {
    return this.children.length > 0 && !this.ignoreHierarchy;
  }

  viewCode(code: CodePlain) {
    this.router.navigate([
      'code',
      {
        registryCode: this.codeScheme.codeRegistry.codeValue,
        schemeCode: this.codeScheme.codeValue,
        codeCode: code.codeValue
      }
    ]);
  }

  codeIdentity(index: number, item: CodePlain) {
    return item.id;
  }

  getIdIdentifier(code: CodePlain) {
    return `${this.codeScheme.codeRegistry.codeValue}_${this.codeScheme.codeValue}_${code.codeValue}`;
  }
}
