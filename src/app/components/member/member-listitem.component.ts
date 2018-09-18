import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { TranslateService } from '@ngx-translate/core';
import { MemberSimple } from '../../entities/member-simple';

@Component({
  selector: 'app-member-listitem',
  styleUrls: ['./member-listitem.component.scss'],
  template: `
    <div id="{{getIdIdentifier() + '_view_member'}}"
         class="member"
         (click)="viewMember()">
      <span class="membertitle">{{member.getDisplayName(languageService, translateService)}}</span>
    </div>
  `
})

export class MemberListitemComponent {

  @Input() codeRegistryCodeValue: string;
  @Input() codeSchemeCodeValue: string;
  @Input() extensionSchemeCodeValue: string;
  @Input() member: MemberSimple;

  constructor(private router: Router,
              public languageService: LanguageService,
              public translateService: TranslateService) {
  }

  viewMember() {
    console.log('View member: ' + this.member.id);
    this.router.navigate([
      'member',
      {
        registryCode: this.codeRegistryCodeValue,
        schemeCode: this.codeSchemeCodeValue,
        extensionSchemeCode: this.extensionSchemeCodeValue,
        memberId: this.member.id
      }
    ]);
  }

  getIdIdentifier() {
    return `${this.member.id}`;
  }
}
