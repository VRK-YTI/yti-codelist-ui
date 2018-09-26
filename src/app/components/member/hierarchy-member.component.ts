import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { TranslateService } from '@ngx-translate/core';
import { MemberSimple } from '../../entities/member-simple';

@Component({
  selector: 'app-hierarchy-member',
  styleUrls: ['./hierarchy-member.component.scss'],
  template: `

    <i [id]="getIdIdentifier() + '_hierarchy_member_expand'" [hidden]="!hasChildren() || expanded"
       class="icon fa fa-plus" (click)="expand()"></i>
    <i [id]="getIdIdentifier() + '_hierarchy_member_collapse'" [hidden]="!hasChildren() || collapsed"
       class="icon fa fa-minus" (click)="collapse()"></i>
    <i id="hierarchy_member_aligner" [hidden]="hasChildren()" class="icon fa"></i>

    <div [id]="getIdIdentifier() + '_view_extension'" class="member" (click)="viewMember()">
      <span class="membertitle">{{member.getDisplayName(languageService, translateService)}}</span>
    </div>

    <ul *ngIf="expanded && hasChildren()">
      <li class="child-extension" *ngFor="let member of children; trackBy: memberIdentity">
        <app-hierarchy-member [members]="members"
                              [member]="member"
                              [codeRegistryCodeValue]="codeRegistryCodeValue"
                              [codeSchemeCodeValue]="codeSchemeCodeValue"
                              [extensionCodeValue]="extensionCodeValue"
                              [ignoreHierarchy]="ignoreHierarchy"></app-hierarchy-member>
      </li>
    </ul>
  `
})

export class HierarchyMemberComponent {

  @Input() members: MemberSimple[];
  @Input() member: MemberSimple;
  @Input() codeRegistryCodeValue: string;
  @Input() codeSchemeCodeValue: string;
  @Input() extensionCodeValue: string;
  @Input() ignoreHierarchy: boolean;

  constructor(private router: Router,
              public languageService: LanguageService,
              public translateService: TranslateService) {
  }

  get children() {
    return this.members.filter(member => member.relatedMember != null && member.relatedMember.id === this.member.id);
  }

  get expanded() {
    return this.member.expanded;
  }

  get collapsed() {
    return !this.expanded;
  }

  expand() {
    this.member.expanded = true;
  }

  collapse() {
    this.member.expanded = false;
  }

  hasChildren() {
    return this.children.length > 0 && !this.ignoreHierarchy;
  }

  viewMember() {
    console.log('View member: ' + this.member.id);
    this.router.navigate([
      'member',
      {
        registryCode: this.codeRegistryCodeValue,
        schemeCode: this.codeSchemeCodeValue,
        extensionCode: this.extensionCodeValue,
        memberId: this.member.id
      }
    ]);
  }

  memberIdentity(index: number, item: MemberSimple) {
    return item.id;
  }

  getIdIdentifier() {
    return `${this.member.id}`;
  }
}
