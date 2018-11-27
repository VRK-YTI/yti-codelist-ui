import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { TranslateService } from '@ngx-translate/core';
import { MemberSimple } from '../../entities/member-simple';

@Component({
  selector: 'app-crossreferencelist-member',
  styleUrls: ['./crossreferencelist-member.component.scss'],
  template: `    
    <div [id]="getIdIdentifier() + '_view_extension'" class="member">
      <span class="membertitle leftside" (click)="viewMember(member.id)">{{member.getDisplayName(languageService, translateService)}}</span> <span class="membertitle rightside" (click)="viewMember(member.relatedMember?.id)">{{member.relatedMember?.getDisplayName(languageService, translateService)}}</span>
    </div>
  `
})

export class CrossReferenceListMemberComponent {

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

  viewMember(memberId: string) {
    this.router.navigate([
      'member',
      {
        registryCode: this.codeRegistryCodeValue,
        schemeCode: this.codeSchemeCodeValue,
        extensionCode: this.extensionCodeValue,
        memberId: memberId
      }
    ]);
  }

  getIdIdentifier() {
    return `${this.member.id}`;
  }
}
