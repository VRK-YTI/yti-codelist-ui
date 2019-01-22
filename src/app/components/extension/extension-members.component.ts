import { Component, Input } from '@angular/core';
import { Member } from '../../entities/member';
import { Extension } from '../../entities/extension';
import { MemberSimple } from '../../entities/member-simple';
import { contains } from 'yti-common-ui/utils/array';
import { localizableMatches } from 'yti-common-ui/utils/localization';

@Component({
  selector: 'app-extension-members',
  templateUrl: './extension-members.component.html',
  styleUrls: ['./extension-members.component.scss']
})
export class ExtensionMembersComponent {

  @Input() members: MemberSimple[];
  @Input() extension: Extension;
  @Input() nrOfCreatedMissingMembers: string;

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
    return this.members.filter(member =>
      member.code.codeValue.toLowerCase().includes(this.searchTerm.toLowerCase())
      || localizableMatches(member.code.prefLabel, this.searchTerm)
      || localizableMatches(member.prefLabel, this.searchTerm)
    );
  }

  get topLevelMembers() {
    return this.members.filter(member => !member.relatedMember);
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

  get numberOfExpanded() {
    return this.parentMembers.filter(member => member.expanded).length;
  }

  get numberOfCollapsed() {
    return this.parentMembers.filter(member => !member.expanded).length;
  }

  get emptySearch() {
    return this.searchTerm && this.listedMembers.length === 0;
  }

  hasHierarchy() {
    return this.members.filter(member => member.relatedMember !== undefined).length > 0;
  }

  searchTermHasValue() {
    return this.searchTerm ? true : false;
  }

  hasExpanded() {
    return this.numberOfExpanded > 0;
  }

  hasCollapsed() {
    return this.numberOfCollapsed > 0;
  }

  expandAll() {
    this.members.map(member => {
      if (contains(this.parentMembers, member)) {
        member.expanded = true;
      }
    });
  }

  collapseAll() {
    this.members.map(member => {
      if (contains(this.parentMembers, member)) {
        member.expanded = false;
      }
    });
  }

  showExpandAll() {
    return this.hasCollapsed() && !this.searchTerm;
  }

  showCollapseAll() {
    return this.hasExpanded() && !this.searchTerm;
  }

  allowExpandAllAndCollapseAll() {
    return this.hasHierarchy && this.members.length <= 500;
  }

  get howManyMissingMembersGotCreated() {
    return this.nrOfCreatedMissingMembers;
  }
}
