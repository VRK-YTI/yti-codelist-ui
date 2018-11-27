import { Component, Input } from '@angular/core';
import { Member } from '../../entities/member';
import { Extension } from '../../entities/extension';
import { MemberSimple } from '../../entities/member-simple';
import { contains } from 'yti-common-ui/utils/array';
import { localizableMatches } from 'yti-common-ui/utils/localization';

@Component({
  selector: 'app-extension-crossreferencelist',
  templateUrl: './extension-crossreferencelist.component.html',
  styleUrls: ['./extension-crossreferencelist.component.scss']
})
export class ExtensionCrossreferencelistComponent {

  @Input() members: MemberSimple[];
  @Input() extension: Extension;

  searchTerm = '';

  constructor() {
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

  get childMembers() {
    return this.members.filter(member => contains(this.parentMembers.map(mem => mem.relatedMember!.id), member.id));
  }

  get numberOfMembers() {
    return this.searchTermHasValue ? this.filteredMembers.length : this.members.length;
  }

  get emptySearch() {
    return this.searchTerm && this.listedMembers.length === 0;
  }

  searchTermHasValue() {
    return this.searchTerm ? true : false;
  }
}
