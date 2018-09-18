import { Component, Input } from '@angular/core';
import { Member } from '../../entities/member';
import { ExtensionScheme } from '../../entities/extension-scheme';
import { MemberSimple } from '../../entities/member-simple';
import { contains } from 'yti-common-ui/utils/array';
import { localizableMatches } from 'yti-common-ui/utils/localization';

@Component({
  selector: 'app-extension-scheme-members',
  templateUrl: './extension-scheme-members.component.html',
  styleUrls: ['./extension-scheme-members.component.scss']
})
export class ExtensionSchemeMembersComponent {

  @Input() members: MemberSimple[];
  @Input() extensionScheme: ExtensionScheme;

  searchTerm = '';

  constructor() {
  }

  memberIdentity(index: number, item: MemberSimple) {
    return item.id;
  }

  getIdIdentifier(extension: Member) {
    return `${this.extensionScheme.parentCodeScheme.codeRegistry.codeValue}_${this.extensionScheme.parentCodeScheme.codeValue}_` +
    `${this.extensionScheme.codeValue}_${extension.id}`;
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
    return this.members.filter(member => !member.broaderMember);
  }

  get parentMembers() {
    const childMembers = this.members.filter(member => member.broaderMember != null);
    const broaderMemberIds = childMembers.map(member => member.broaderMember!.id);

    return this.members.filter(member => contains(broaderMemberIds, member.id));
  }

  get childMembers() {
    return this.members.filter(member => contains(this.parentMembers.map(mem => mem.broaderMember!.id), member.id));
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
    return this.members.filter(member => member.broaderMember !== undefined).length > 0;
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
}
