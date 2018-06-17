import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { EditableService } from '../../services/editable.service';
import { Subscription } from 'rxjs/Subscription';
import { LanguageService } from '../../services/language.service';
import { UserService } from 'yti-common-ui/services/user.service';
import { DataService } from '../../services/data.service';
import { CodeListConfirmationModalService } from '../common/confirmation-modal.service';
import { Extension } from '../../entities/extension';

@Component({
  selector: 'app-extension-information',
  templateUrl: './extension-information.component.html',
  styleUrls: ['./extension-information.component.scss']
})
export class ExtensionInformationComponent implements OnChanges, OnDestroy {

  @Input() extension: Extension;

  cancelSubscription: Subscription;

  extensionForm = new FormGroup({
    extensionValue: new FormControl(),
    code: new FormControl(null),
    extension: new FormControl(null),
    status: new FormControl()
  });

  constructor(private dataService: DataService,
              private userService: UserService,
              private confirmationModalService: CodeListConfirmationModalService,
              private editableService: EditableService,
              public languageService: LanguageService) {

    this.cancelSubscription = editableService.cancel$.subscribe(() => this.reset());
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.reset();
  }

  reset() {
    const {...rest} = this.extension;

    this.extensionForm.reset({
      ...rest
    });
  }

  get editing() {
    return this.editableService.editing;
  }

  get isSuperUser() {
    return this.userService.user.superuser;
  }

  get restricted() {
    if (this.isSuperUser) {
      return false;
    }
    return this.extension.extensionScheme.restricted;
  }

  ngOnDestroy() {
    this.cancelSubscription.unsubscribe();
  }
}
