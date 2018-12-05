import { Component, Input } from '@angular/core';
import { Member } from '../../entities/member';
import { Extension } from '../../entities/extension';
import { MemberSimple } from '../../entities/member-simple';
import { contains } from 'yti-common-ui/utils/array';
import { localizableMatches } from 'yti-common-ui/utils/localization';
import { Router } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { TranslateService } from '@ngx-translate/core';
import { ConfigurationService } from '../../services/configuration.service';

@Component({
  selector: 'app-extension-crossreferencelist',
  templateUrl: './extension-crossreferencelist.component.html',
  styleUrls: ['./extension-crossreferencelist.component.scss']
})
export class ExtensionCrossreferencelistComponent {

  @Input() members: MemberSimple[];
  @Input() extension: Extension;

  searchTerm = '';

  constructor(private router: Router,
              public languageService: LanguageService,
              public translateService: TranslateService,
              private configurationService: ConfigurationService) {
  }

  memberIdentity(index: number, item: MemberSimple) {
    return item.id;
  }

  getIdIdentifier(extension: Member) {
    return `${this.extension.parentCodeScheme.codeRegistry.codeValue}_${this.extension.parentCodeScheme.codeValue}_` +
      `${this.extension.codeValue}_${extension.id}`;
  }

  get listedMembers() {
    return this.searchTerm ? this.filteredMembers : this.topLevelMembers;
  }

  get filteredMembers() {
    return this.topLevelMembers.filter(member =>
      member.code.codeValue.toLowerCase().includes(this.searchTerm.toLowerCase())
      || localizableMatches(member.code.prefLabel, this.searchTerm)
      || localizableMatches(member.prefLabel, this.searchTerm)
    );
  }

  get topLevelMembers() {
    return this.members.filter(member => member.relatedMember);
  }

  get parentMembers() {
    const childMembers = this.members.filter(member => member.relatedMember != null);
    const relatedMemberIds = childMembers.map(member => member.relatedMember!.id);

    return this.members.filter(member => contains(relatedMemberIds, member.id));
  }
}
