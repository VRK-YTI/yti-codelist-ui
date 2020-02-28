import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChange, SimpleChanges, ViewChild } from '@angular/core';
import { Member } from '../../entities/member';
import { Extension } from '../../entities/extension';
import { MemberSimple } from '../../entities/member-simple';
import { contains } from 'yti-common-ui/utils/array';
import { localizableMatches } from 'yti-common-ui/utils/localization';
import { VirtualScrollerComponent } from 'ngx-virtual-scroller';
import { BehaviorSubject, combineLatest, Subscription } from 'rxjs';

@Component({
  selector: 'app-extension-members',
  templateUrl: './extension-members.component.html',
  styleUrls: ['./extension-members.component.scss']
})
export class ExtensionMembersComponent implements OnInit, OnDestroy, OnChanges {

  @Input() members: MemberSimple[];
  @Input() extension: Extension;
  @Input() nrOfCreatedMissingMembers: string;
  @ViewChild('scroll') virtualScroller: VirtualScrollerComponent;

  listedMembers: MemberSimple[] = [];
  memberCount: number = 0;

  private parentMembers: MemberSimple[] = [];
  private hasHierarchy: boolean = false;

  private sourceMembers: BehaviorSubject<MemberSimple[]> = new BehaviorSubject([]);
  private searchTerm_: BehaviorSubject<string> = new BehaviorSubject('');
  private subscriptions: Subscription[] = [];

  constructor() {
  }

  ngOnInit(): void {
    this.subscriptions.push(combineLatest(this.searchTerm_, this.sourceMembers).subscribe(([search, members]) => {
      if (search) {
        this.listedMembers = members.filter(member =>
          member.code.codeValue.toLowerCase().includes(this.searchTerm.toLowerCase())
          || localizableMatches(member.code.prefLabel, this.searchTerm)
          || localizableMatches(member.prefLabel, this.searchTerm)
        );
        this.parentMembers = [];
        this.memberCount = this.listedMembers.length;
      } else {
        const parentIds: { [id: string]: boolean } = {};
        members.forEach(member => {
          if (member.relatedMember) {
            parentIds[member.relatedMember.id] = true;
          }
        });
        this.listedMembers = members.filter(member => !member.relatedMember);
        this.parentMembers = members.filter(member => parentIds[member.id]);
        this.memberCount = members.length;
      }
      this.hasHierarchy = !!this.parentMembers.length;
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  ngOnChanges(changes: SimpleChanges) {
    const membersChange: SimpleChange = changes.members;
    if (membersChange) {
      this.sourceMembers.next(membersChange.currentValue ? membersChange.currentValue : []);
    }
  }

  get emptySearch(): boolean {
    return this.searchTermHasValue && this.listedMembers.length === 0;
  }

  get searchTermHasValue(): boolean {
    return !!this.searchTerm_.getValue();
  }

  get searchTerm(): string {
    return this.searchTerm_.getValue();
  }

  set searchTerm(value: string) {
    this.searchTerm_.next(value);
  }

  get useVirtualScroller(): boolean {
    return this.members.length > 500 && (!this.hasHierarchy || this.listedMembers.length > 200);
  }

  memberIdentity(index: number, item: MemberSimple) {
    return item.id;
  }

  getIdIdentifier(extension: Member) {
    return `${this.extension.parentCodeScheme.codeRegistry.codeValue}_${this.extension.parentCodeScheme.codeValue}_` +
      `${this.extension.codeValue}_${extension.id}`;
  }

  expandAll() {
    this.members.forEach(member => {
      if (contains(this.parentMembers, member)) {
        member.expanded = true;
      }
    });
  }

  collapseAll() {
    this.members.forEach(member => {
      if (contains(this.parentMembers, member)) {
        member.expanded = false;
      }
    });
  }

  showExpandAll() {
    return !this.searchTermHasValue && !!this.parentMembers.find(member => !member.expanded);
  }

  showCollapseAll() {
    return !this.searchTermHasValue && !!this.parentMembers.find(member => member.expanded);
  }

  allowExpandAllAndCollapseAll() {
    return this.sourceMembers.getValue().length <= 500 && this.hasHierarchy;
  }

  onItemResize(event: { member: MemberSimple, expanded: boolean }) {
    let member: MemberSimple | undefined = event.member;
    while (member && member.relatedMember) {
      const parentId: string = member.relatedMember.id;
      member = this.parentMembers.find(p => p.id === parentId);
    }
    if (member) {
      this.virtualScroller.invalidateCachedMeasurementForItem(member);
    } else {
      console.error('Could not find root member for collapsed or expanded member');
    }
  }
}
