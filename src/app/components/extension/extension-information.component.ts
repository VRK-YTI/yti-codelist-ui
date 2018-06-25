import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
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

@Component({
  selector: 'app-extension-information',
  templateUrl: './extension-information.component.html',
  styleUrls: ['./extension-information.component.scss']
})
export class ExtensionInformationComponent implements OnInit, OnChanges, OnDestroy {

  @Input() extension: Extension;
  extensionScheme: ExtensionScheme;

  cancelSubscription: Subscription;

  extensionForm = new FormGroup({
    extensionValue: new FormControl('', [Validators.required, this.isExtensionValueValid]),
    code: new FormControl(null, Validators.required),
    extension: new FormControl(null)
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
      throw new Error(`Illegal route, extensionId: '${extensionId}', registry: '${registryCodeValue}', scheme: '${schemeCodeValue}', extensionScheme: '${extensionSchemeCodeValue}'`);
    }

    this.dataService.getExtension(extensionId).subscribe(extension => {
      this.extension = extension;
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

  get loading(): boolean {
    return this.extensionScheme == null || this.extension == null;
  }

  canSave() {
    return this.extensionForm.valid;
  }

  isExtensionValueValid (control: AbstractControl) {
    const extensionValue = control.value;
    const valid = extensionValue != null && extensionValue.length > 0;
    return !valid ? {'extensionValueValidationError': {value: extensionValue}} : null;
  }
}
