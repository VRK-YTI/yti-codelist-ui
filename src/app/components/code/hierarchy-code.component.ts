import { Component, Input } from '@angular/core';
import { Code } from '../../entities/code';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hierarchy-code',
  styleUrls: ['./hierarchy-code.component.scss'],
  template: `
    <i [hidden]="!hasChildren() || expanded" class="fa fa-plus" (click)="expand()"></i>
    <i [hidden]="!hasChildren() || collapsed" class="fa fa-minus" (click)="collapse()"></i>
    
    <div class="code" (click)="viewCode(code)">
      <span *ngIf="code.hasPrefLabel()" >{{code.codeValue}} - {{code.prefLabel | translateValue}}</span>
      <span *ngIf="!code.hasPrefLabel()" >{{code.codeValue}}</span>
    </div>

    <ul *ngIf="expanded && hasChildren()">
      <li class="child-code" *ngFor="let code of children">
        <app-hierarchy-code [codes]="codes" [code]="code"></app-hierarchy-code>
      </li>
    </ul>
  `
})

export class HierarchyCodeComponent {
 
  @Input() codes: Code[];
  @Input() code: Code;

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

  viewCode(code: Code) {
    console.log('View code: ' + code.codeValue);
    this.router.navigate(code.route);
  }
}
