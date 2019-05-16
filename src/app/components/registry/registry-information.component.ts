import { EditableService } from '../../services/editable.service';
import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { UserService } from 'yti-common-ui/services/user.service';
import { DataService } from '../../services/data.service';
import { LanguageService } from '../../services/language.service';
import { CodeListErrorModalService } from '../common/error-modal.service';
import { CodeRegistry } from '../../entities/code-registry';
import { FormControl, FormGroup } from '@angular/forms';
import { requiredList } from 'yti-common-ui/utils/validator';
import { ConfigurationService } from '../../services/configuration.service';
import { nonEmptyLocalizableValidator } from '../../utils/validators';

@Component({
  selector: 'app-code-registry-information',
  templateUrl: './registry-information.component.html',
  styleUrls: ['./registry-information.component.scss']
})
export class RegistryInformationComponent implements OnChanges, OnDestroy {

  @Input() codeRegistry: CodeRegistry;

  codeRegistryForm = new FormGroup({
    prefLabel: new FormControl({}, nonEmptyLocalizableValidator),
    description: new FormControl({}),
    organizations: new FormControl([], [requiredList])
  });

  cancelSubscription: Subscription;

  constructor(private userService: UserService,
              private dataService: DataService,
              private router: Router,
              private errorModalService: CodeListErrorModalService,
              private editableService: EditableService,
              public languageService: LanguageService,
              private configurationService: ConfigurationService) {

    this.cancelSubscription = editableService.cancel$.subscribe(() => this.reset());
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.reset();
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
}
