import { Component, Input, Optional, Self } from '@angular/core';
import { EditableService } from '../../services/editable.service';
import { ControlValueAccessor, FormControl, NgControl } from '@angular/forms';
import { ignoreModalClose } from 'yti-common-ui/utils/modal';
import { SearchLinkedMemberModalService } from './search-linked-member-modal.component';
import { DataService } from '../../services/data.service';
import { TranslateService } from '@ngx-translate/core';
import { Extension } from '../../entities/extension';
import { Member } from '../../entities/member';
import { LanguageService } from '../../services/language.service';

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
                (click)="selectMember()" translate>Select member</button>
      </dd>
    </dl>
  `
})
export class MemberInputComponent implements ControlValueAccessor {

  @Input() label: string;
  @Input() extension: Extension;
  @Input() currentMember: Member;
  @Input() required = false;
  control = new FormControl(null);

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

  get member(): Member {
    return this.control.value;
  }

  selectMember() {
    const titleLabel = this.translateService.instant('Choose member');
    const searchlabel = this.translateService.instant('Search member');
    const members = this.dataService.getMembers(
      this.extension.parentCodeScheme.codeRegistry.codeValue,
      this.extension.parentCodeScheme.codeValue,
      this.extension.codeValue);

    this.searchLinkedExtensionModalService.open(
      members,
      titleLabel,
      searchlabel,
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
