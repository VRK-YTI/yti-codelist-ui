import { Component, Input, OnChanges, OnDestroy, SimpleChanges, OnInit} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { EditableService } from '../../services/editable.service';
import { CodeListConfirmationModalService } from '../common/confirmation-modal.service';
import { LanguageService } from '../../services/language.service';
import { validDateRange } from '../../utils/date';
import { UserService } from 'yti-common-ui/services/user.service';
import { DataService } from '../../services/data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CodeListErrorModalService } from '../common/error-modal.service';
import { ExtensionScheme } from '../../entities/extension-scheme';
import { LocationService } from '../../services/location.service';

@Component({
  selector: 'app-extension-scheme-information',
  templateUrl: './extension-scheme-information.component.html',
  styleUrls: ['./extension-scheme-information.component.scss']
})
export class ExtensionSchemeInformationComponent implements OnChanges, OnDestroy, OnInit {

  @Input() extensionScheme: ExtensionScheme;

  env: string;

  extensionSchemeForm = new FormGroup({
    prefLabel: new FormControl({}),
    propertyType: new FormControl(null),
    validity: new FormControl(null, validDateRange),
    status: new FormControl()
  });

  cancelSubscription: Subscription;

  constructor(private userService: UserService,
              private dataService: DataService,
              private route: ActivatedRoute,
              private router: Router,
              private locationService: LocationService,
              private errorModalService: CodeListErrorModalService,
              private confirmationModalService: CodeListConfirmationModalService,
              private editableService: EditableService,
              public languageService: LanguageService) {

    this.cancelSubscription = editableService.cancel$.subscribe(() => this.reset());

    dataService.getServiceConfiguration().subscribe(configuration => {
      this.env = configuration.env;
    });
  }

  ngOnInit() {
    if (!this.extensionScheme) {
      const registryCodeValue = this.route.snapshot.params.registryCode;
      const schemeCodeValue = this.route.snapshot.params.schemeCode;
      const extensionSchemeCodeValue = this.route.snapshot.params.extensionSchemeCode;

      if (!registryCodeValue || !schemeCodeValue || !schemeCodeValue) {
        throw new Error(
          `Illegal route, registry: '${registryCodeValue}', scheme: '${schemeCodeValue}', extensionScheme: '${extensionSchemeCodeValue}`);
      }

      this.dataService.getExtensionScheme(registryCodeValue, schemeCodeValue, extensionSchemeCodeValue).subscribe(extensionScheme => {
        this.extensionScheme = extensionScheme;
        this.locationService.atExtensionSchemePage(extensionScheme);
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.reset();
  }

  private reset() {
    const { startDate, endDate, ...rest } = this.extensionScheme;

    this.extensionSchemeForm.reset({
      ...rest,
      validity: { start: startDate, end: endDate }
    });
  }

  ngOnDestroy() {
    this.cancelSubscription.unsubscribe();
  }

  get showUnfinishedFeature() {
    return this.env === 'dev';
  }

  get editing() {
    return this.editableService.editing;
  }

  get isSuperUser() {
    return this.userService.user.superuser;
  }

  get restricted(): boolean {
    if (this.isSuperUser) {
      return false;
    }
    return this.extensionScheme.restricted;
  }
}
