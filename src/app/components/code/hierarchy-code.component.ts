import { Component, Input } from '@angular/core';
import { Code } from '../../entities/code';
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

    <div id="{{code.id + '_view_code'}}" class="code" (click)="viewCode(code)">
      <app-status class="pull-right status" [status]="code.status"></app-status>
      <span *ngIf="code.hasPrefLabel()" class="codetitle">{{code.codeValue}} - {{code.prefLabel | translateValue}}</span>
      <span *ngIf="!code.hasPrefLabel()" class="codetitle">{{code.codeValue}}</span>
    </div>

    <ul *ngIf="expanded && hasChildren()">
      <li class="child-code" *ngFor="let code of children">
        <app-hierarchy-code id="{{code.id + '_codelist_childcode_listitem'}}" [codes]="codes"
                            [code]="code" [codeScheme}="codeScheme"></app-hierarchy-code>
      </li>
    </ul>
  `
})

export class HierarchyCodeComponent {

  @Input() codes: Code[];
  @Input() code: Code;
  @Input() codeScheme: CodeScheme;

  constructor(private router: Router) {
  }

  get children() {
    return this.codes.filter(code => code.broaderCodeId === this.code.id);
  }

  get expanded() {
    return this.code.expanded;
  }

  get collapsed() {
    return !this.expanded;
  }

  expand() {
    this.code.expanded = true;
  }

  collapse() {
    this.code.expanded = false;
  }

  hasChildren() {
    return this.children.length > 0;
  }

  viewCode(code: CodePlain) {
    console.log('View code: ' + code.codeValue);
    this.router.navigate([
      'code',
      {
        registryCode: this.codeScheme.codeRegistry.codeValue,
        schemeCode: this.codeScheme.codeValue,
        codeCode: code.codeValue
      }
    ]);
  }
}
