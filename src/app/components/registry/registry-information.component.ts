import { EditableService } from '../../services/editable.service';
import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Router } from '@angular/router';
import { UserService } from 'yti-common-ui/services/user.service';
import { DataService } from '../../services/data.service';
import { LanguageService } from '../../services/language.service';
import { CodeListErrorModalService } from '../common/error-modal.service';
import { CodeRegistry } from '../../entities/code-registry';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-code-registry-information',
  templateUrl: './registry-information.component.html',
  styleUrls: ['./registry-information.component.scss']
})
export class RegistryInformationComponent implements OnChanges, OnDestroy {

  @Input() codeRegistry: CodeRegistry;
  env: string;

  // TODO: Change definition to description (YTI-981 & YTI-982).

  codeRegistryForm = new FormGroup({
    prefLabel: new FormControl({}),
    definition: new FormControl({}),
    organizations: new FormControl([])
  });

  cancelSubscription: Subscription;

  constructor(private userService: UserService,
              private dataService: DataService,
              private router: Router,
              private errorModalService: CodeListErrorModalService,
              private editableService: EditableService,
              public languageService: LanguageService) {

    this.cancelSubscription = editableService.cancel$.subscribe(() => this.reset());

    dataService.getServiceConfiguration().subscribe(configuration => {
      this.env = configuration.env;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.reset();
  }

  ngOnDestroy() {
    this.cancelSubscription.unsubscribe();
  }

  private reset() {
    const {organizations, ...rest} = this.codeRegistry;

    this.codeRegistryForm.reset({
      ...rest,
      organizations: organizations.map(organization => organization.clone())
    });
  }

  get loading() {
    return this.env == null;
  }

  getRegistryUri() {
    if (this.env !== 'prod') {
      return this.codeRegistry.uri + '?env=' + this.env;
    }
    return this.codeRegistry.uri;
  }
}
