import { AfterViewInit, Component, Input, OnInit, Optional, Self } from '@angular/core';
import { EditableService } from '../../services/editable.service';
import { ControlValueAccessor, FormControl, NgControl } from '@angular/forms';
import { ignoreModalClose } from 'yti-common-ui/utils/modal';
import { SearchLinkedMemberModalService } from './search-linked-member-modal.component';
import { DataService } from '../../services/data.service';
import { TranslateService } from '@ngx-translate/core';
import { Extension } from '../../entities/extension';
import { Member } from '../../entities/member';
import { LanguageService } from '../../services/language.service';
import { MemberSimple } from '../../entities/member-simple';
import { Observable } from 'rxjs';
import { CodeScheme } from '../../entities/code-scheme';

function addToControl<T>(control: FormControl, item: T) {

  control.setValue(item);
}

function removeFromControl<T>(control: FormControl) {

  control.setValue(null);
}

@Component({
  selector: 'app-member-input',
  template: `
    <dl *ngIf="editing || member">
      <dt>
        <label>{{label}}</label>
        <app-information-symbol [infoText]="infoText"></app-information-symbol>
        <app-required-symbol *ngIf="required && editing"></app-required-symbol>
      </dt>
      <dd>
        <div *ngIf="!editing && member">
          <span>{{member.getDisplayName(languageService, translateService)}}</span>
        </div>
        <div *ngIf="editing && member">
          <a  class="removal-X">
            <i id="remove_member_link"
               class="fa fa-times"
               (click)="removeMember(member)"></i>
          </a>
          <span>{{member.getDisplayName(languageService, translateService)}}</span>
          <app-error-messages id="extension_error_messages" [control]="parentControl"></app-error-messages>
        </div>

        <button id="add_member_button"
                type="button"
                class="btn btn-sm btn-action mt-2"
                *ngIf="editing"
                [disabled]="addMemberButtonMustBeDisabled"
                (click)="selectMember()" translate>Select member</button>
      </dd>
    </dl>
  `
})
export class MemberInputComponent implements ControlValueAccessor, AfterViewInit {

  @Input() label: string;
  @Input() extension: Extension;
  @Input() currentMember: Member;
  @Input() required = false;
  @Input() codeSchemes: CodeScheme[];
  @Input() infoText: string;

  control = new FormControl(null);

  membersToInspect: Observable<Member[]>;

  /**
   * If this extension is a crossRefenceList, we must stop attaching a hierchical parent to this extension,
   * if this extension already has a child, due to the fact that the max nr of hierachy levels is 2
   * with crossReferenceLists.
   */
  addMemberButtonMustBeDisabled = false;

  private propagateChange: (fn: any) => void = () => {
  };
  private propagateTouched: (fn: any) => void = () => {
  };

  constructor(@Self() @Optional() public parentControl: NgControl,
              private editableService: EditableService,
              public translateService: TranslateService,
              public languageService: LanguageService,
              private dataService: DataService,
              private searchLinkedExtensionModalService: SearchLinkedMemberModalService) {

    this.control.valueChanges.subscribe(x => this.propagateChange(x));

    if (parentControl) {
      parentControl.valueAccessor = this;
    }
  }

  ngAfterViewInit() {

    // If this is a Cross-Reference List, the hierachy must never exceed 2 levels. Thus, if current member has children,
    // we disable adding a parent to the current one.
    if (this.extension.propertyType.localName === 'crossReferenceList') {

      this.membersToInspect = this.dataService.getMembers(
        this.extension.parentCodeScheme.codeRegistry.codeValue,
        this.extension.parentCodeScheme.codeValue,
        this.extension.codeValue);

      this.membersToInspect.subscribe(membersArray => {
        const someChildOfTheCurrentMember = membersArray.filter( member => {
          return member.relatedMember !== undefined && this.currentMember !== undefined && member.relatedMember.id === this.currentMember.id;
        })[0]; // NOTE! We are only interested to see if even one child exists, thus we take the first one
        if (someChildOfTheCurrentMember === undefined) {
          this.addMemberButtonMustBeDisabled = false; // if no children exist, OK to add parent
        } else {
          this.addMemberButtonMustBeDisabled = true;
        }
      });
    } else {
      this.addMemberButtonMustBeDisabled = false;
    }
  }

  get member(): Member {
    return this.control.value;
  }

  selectMember() {
    const titleLabel = this.translateService.instant('Choose member');
    const searchlabel = this.translateService.instant('Search member');

    let members;

    // if this is a cross-reference list, and we are picking a hierarchical parent member,
    // this parent cannot have its own parent so we filter those out with a parent. This is
    // because a cross-reference is not a hierarchy, really, it is always exactly 2 levels
    // deep, for example: Maakunnat - Kunnat mapping.
    if (this.extension.propertyType.localName === 'crossReferenceList') {
      members = this.dataService.getMembersWithoutParents(
        this.extension.parentCodeScheme.codeRegistry.codeValue,
        this.extension.parentCodeScheme.codeValue,
        this.extension.codeValue);
    } else {
      members = this.dataService.getMembers(
        this.extension.parentCodeScheme.codeRegistry.codeValue,
        this.extension.parentCodeScheme.codeValue,
        this.extension.codeValue);
    }


    this.searchLinkedExtensionModalService.open(
      members,
      titleLabel,
      searchlabel,
      this.codeSchemes,
      [this.currentMember ? this.currentMember.id : ''],
      false)
      .then(extension => addToControl(this.control, extension), ignoreModalClose);
  }

  removeMember() {
    removeFromControl(this.control);
  }

  get editing() {
    return this.editableService.editing;
  }

  writeValue(obj: any): void {
    this.control.setValue(obj);
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.propagateTouched = fn;
  }
}
