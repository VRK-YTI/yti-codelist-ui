import { Component, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup, Validators } from '@angular/forms';
import { EditableService } from '../../services/editable.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { Status } from 'yti-common-ui/entities/status';
import { formatDate, validDateRange } from '../../utils/date';
import { ExtensionSchemeType } from '../../services/api-schema';
import { Observable } from 'rxjs/Observable';
import { CodeScheme } from '../../entities/code-scheme';
import { Location } from '@angular/common';
import { LocationService } from '../../services/location.service';

@Component({
  selector: 'app-extension-scheme-create',
  templateUrl: './extension-scheme-create.component.html',
  styleUrls: ['./extension-scheme-create.component.scss'],
  providers: [EditableService]
})
export class ExtensionSchemeCreateComponent implements OnInit {

  codeScheme: CodeScheme;
  env: string;

  extensionSchemeForm = new FormGroup({
    codeValue: new FormControl('', [Validators.required, this.isCodeValuePatternValid]),
    prefLabel: new FormControl({}),
    validity: new FormControl({start: null, end: null}, validDateRange),
    propertyType: new FormControl(null),
    status: new FormControl('DRAFT' as Status),
  }, null, this.codeValueExistsValidator());

  constructor(private route: ActivatedRoute,
              private router: Router,
              private dataService: DataService,
              private editableService: EditableService,
              private location: Location,
              private locationService: LocationService) {

    editableService.onSave = (formValue: any) => this.save(formValue);
    editableService.cancel$.subscribe(() => this.back());
    this.editableService.edit();

    dataService.getServiceConfiguration().subscribe(configuration => {
      this.env = configuration.env;
    });
  }

  ngOnInit() {
    const registryCode = this.route.snapshot.params.registryCode;
    console.log('CodeCreateComponent onInit registryCode: ' + registryCode);
    const schemeCode = this.route.snapshot.params.schemeCode;
    console.log('CodeCreateComponent onInit schemeCode: ' + schemeCode);

    if (!registryCode || !schemeCode) {
      throw new Error(`Illegal route, registry: '${registryCode}', scheme: '${schemeCode}'`);
    }

    this.dataService.getCodeScheme(registryCode, schemeCode).subscribe(codeScheme => {
      this.codeScheme = codeScheme;
      this.locationService.atExtensionSchemeCreatePage(this.codeScheme);
    });
  }

  get showUnfinishedFeature() {
    return this.env === 'dev';
  }

  get loading(): boolean {
    return !this.env && this.codeScheme == null;
  }

  back() {
    this.location.back();
  }

  save(formData: any): Observable<any> {

    console.log('Saving new ExtensionScheme');

    const {validity, propertyType, ...rest} = formData;

    const extensionScheme: ExtensionSchemeType = <ExtensionSchemeType> {
      ...rest,
      startDate: formatDate(validity.start),
      endDate: formatDate(validity.end),
      propertyType: propertyType.serialize()
    };

    console.log('Saving new ExtensionScheme');
    return this.dataService.createExtensionScheme(extensionScheme, this.codeScheme.codeRegistry.codeValue, this.codeScheme.codeValue)
      .do(createdExtensionScheme => {
        console.log('Saved new ExtensionScheme');
        this.router.navigate(createdExtensionScheme.route);
      });
  }

  isCodeValuePatternValid(control: AbstractControl) {
    const isCodeValueValid = control.value.match(/^[a-zA-Z0-9_\-]*$/);
    return !isCodeValueValid ? {'codeValueValidationError': {value: control.value}} : null;
  }

  codeValueExistsValidator(): AsyncValidatorFn {
    return (control: AbstractControl) => {
      const registryCodeValue = this.codeScheme.codeRegistry.codeValue;
      const schemeCodeValue = this.codeScheme.codeValue;
      const extensionSchemeCodeValue = control.value.codeValue;
      const validationError = {
        extensionSchemeCodeValueExists: {
          valid: false
        }
      };
      return this.dataService.extensionSchemeCodeValueExists(registryCodeValue, schemeCodeValue, extensionSchemeCodeValue)
        .map(exists => exists ? validationError : null);
    };
  }
}
