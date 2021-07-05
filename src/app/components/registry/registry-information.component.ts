import { EditableService } from '../../services/editable.service';
import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { LanguageService } from '../../services/language.service';
import { CodeListErrorModalService } from '../common/error-modal.service';
import { CodeRegistry } from '../../entities/code-registry';
import { FormControl, FormGroup } from '@angular/forms';
import { ConfigurationService } from '../../services/configuration.service';
import { nonEmptyLocalizableValidator } from '../../utils/validators';
import { AuthorizationManager } from '../../services/authorization-manager.service';
import { UserSimple } from '../../entities/user-simple';
import { requiredList, UserService } from '@vrk-yti/yti-common-ui';

@Component({
  selector: 'app-code-registry-information',
  templateUrl: './registry-information.component.html',
  styleUrls: ['./registry-information.component.scss']
})
export class RegistryInformationComponent implements OnInit, OnChanges, OnDestroy {

  @Input() codeRegistry: CodeRegistry;

  codeRegistryForm = new FormGroup({
    prefLabel: new FormControl({}, nonEmptyLocalizableValidator),
    description: new FormControl({}),
    organizations: new FormControl([], [requiredList])
  });

  cancelSubscription: Subscription;

  user$ = new BehaviorSubject<UserSimple | null>(null);

  constructor(public languageService: LanguageService,
              private authorizationManager: AuthorizationManager,
              private userService: UserService,
              private dataService: DataService,
              private router: Router,
              private errorModalService: CodeListErrorModalService,
              private editableService: EditableService,
              private configurationService: ConfigurationService) {

    this.cancelSubscription = editableService.cancel$.subscribe(() => this.reset());
  }

  ngOnInit() {

    this.fetchUserInformation();
  }

  ngOnChanges(changes: SimpleChanges): void {

    this.fetchUserInformation();
    this.reset();
  }

  fetchUserInformation() {

    if (!this.authorizationManager.user.anonymous) {
      this.dataService.findUserForCodeRegistry(this.codeRegistry.id).subscribe(user => {
        this.user = user;
      });
    }
  }

  ngOnDestroy() {

    this.cancelSubscription.unsubscribe();
  }

  private reset() {
    const { organizations, ...rest } = this.codeRegistry;

    this.codeRegistryForm.reset({
      ...rest,
      organizations: organizations.map(organization => organization.clone())
    });
  }

  getRegistryUri() {

    return this.configurationService.getUriWithEnv(this.codeRegistry.uri);
  }

  get user(): UserSimple | null {

    return this.user$.getValue();
  }

  set user(value: UserSimple | null) {

    this.user$.next(value);
  }
}
