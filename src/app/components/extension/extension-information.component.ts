import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { EditableService } from '../../services/editable.service';
import { Subscription } from 'rxjs/Subscription';
import { LanguageService } from '../../services/language.service';
import { UserService } from 'yti-common-ui/services/user.service';
import { DataService } from '../../services/data.service';
import { CodeListConfirmationModalService } from '../common/confirmation-modal.service';
import { Extension } from '../../entities/extension';
import { ExtensionScheme } from '../../entities/extension-scheme';
import { LocationService } from '../../services/location.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CodeScheme } from '../../entities/code-scheme';
import { validDateRange } from '../../utils/date';

@Component({
  selector: 'app-extension-information',
  templateUrl: './extension-information.component.html',
  styleUrls: ['./extension-information.component.scss']
})
export class ExtensionInformationComponent implements OnInit, OnChanges, OnDestroy {

  @Input() currentExtension: Extension;
  extensionScheme: ExtensionScheme;

  cancelSubscription: Subscription;

  extensionForm = new FormGroup({
    prefLabel: new FormControl({}),
    extensionValue: new FormControl(''),
    code: new FormControl(null, Validators.required),
    extension: new FormControl(null),
    validity: new FormControl(null, validDateRange)
  });

  constructor(private route: ActivatedRoute,
              private router: Router,
              private locationService: LocationService,
              private dataService: DataService,
              private userService: UserService,
              private confirmationModalService: CodeListConfirmationModalService,
              private editableService: EditableService,
              public languageService: LanguageService) {

    this.cancelSubscription = editableService.cancel$.subscribe(() => this.reset());
  }

  ngOnInit() {

    const registryCodeValue = this.route.snapshot.params.registryCode;
    const schemeCodeValue = this.route.snapshot.params.schemeCode;
    const extensionSchemeCodeValue = this.route.snapshot.params.extensionSchemeCode;
    const extensionId = this.route.snapshot.params.extensionId;

    if (!extensionId || !registryCodeValue || !schemeCodeValue || !extensionSchemeCodeValue) {
      throw new Error(`Illegal route, extensionId: '${extensionId}', registry: '${registryCodeValue}', ` +
        `scheme: '${schemeCodeValue}', extensionScheme: '${extensionSchemeCodeValue}'`);
    }

    this.dataService.getExtension(extensionId).subscribe(extension => {
      this.currentExtension = extension;
      this.locationService.atExtensionPage(extension);
    });

    this.dataService.getExtensionScheme(registryCodeValue, schemeCodeValue, extensionSchemeCodeValue).subscribe(extensionScheme => {
      this.extensionScheme = extensionScheme;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.reset();
  }

  reset() {
    const { startDate, endDate, ...rest } = this.currentExtension;

    this.extensionForm.reset({
      ...rest,
      validity: { start: startDate, end: endDate }
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
    return this.currentExtension.extensionScheme.restricted;
  }

  ngOnDestroy() {
    this.cancelSubscription.unsubscribe();
  }

  get loading(): boolean {
    return this.extensionScheme == null || this.currentExtension == null;
  }

  canSave() {
    return this.extensionForm.valid;
  }

  get requireExtensionValue(): boolean {
    return this.extensionScheme.propertyType.localName === 'calculationHierarchy';
  }

  get allCodeSchemes(): CodeScheme[] {
    return [ this.extensionScheme.parentCodeScheme, ...this.extensionScheme.codeSchemes ];
  }
}
