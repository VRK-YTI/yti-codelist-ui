import { Component, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup, Validators } from '@angular/forms';
import { EditableService } from '../../services/editable.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { Status, restrictedStatuses } from 'yti-common-ui/entities/status';
import { formatDate, validDateRange } from '../../utils/date';
import { ExtensionSchemeType } from '../../services/api-schema';
import { Observable, from } from 'rxjs';
import { CodeScheme } from '../../entities/code-scheme';
import { Location } from '@angular/common';
import { LocationService } from '../../services/location.service';
import { map, tap, flatMap } from 'rxjs/operators';
import { PropertyType } from '../../entities/property-type';
import { contains } from 'yti-common-ui/utils/array';
import { CodeListConfirmationModalService } from '../common/confirmation-modal.service';

@Component({
  selector: 'app-extension-scheme-create',
  templateUrl: './extension-scheme-create.component.html',
  styleUrls: ['./extension-scheme-create.component.scss'],
  providers: [EditableService]
})
export class ExtensionSchemeCreateComponent implements OnInit {

  codeScheme: CodeScheme;
  env: string;
  codeSchemes: CodeScheme[];
  propertyType: PropertyType;
  title: string;

  extensionSchemeForm = new FormGroup({
    codeValue: new FormControl('', [Validators.required, this.isCodeValuePatternValid]),
    prefLabel: new FormControl({}),
    validity: new FormControl({ start: null, end: null }, validDateRange),
    codeSchemes: new FormControl([]),
    status: new FormControl('DRAFT' as Status),
  }, null, this.codeValueExistsValidator());

  constructor(private route: ActivatedRoute,
              private router: Router,
              private dataService: DataService,
              private editableService: EditableService,
              private location: Location,
              private locationService: LocationService,
              private confirmationModalService: CodeListConfirmationModalService) {

    editableService.onSave = (formValue: any) => this.save(formValue);
    editableService.cancel$.subscribe(() => this.back());
    this.editableService.edit();

    dataService.getServiceConfiguration().subscribe(configuration => {
      this.env = configuration.env;
    });
  }

  ngOnInit() {
    const registryCode = this.route.snapshot.params.registryCode;
    const schemeCode = this.route.snapshot.params.schemeCode;
    const propertyTypeLocalName = this.route.snapshot.params.propertyTypeLocalName;

    this.resolveTitle(propertyTypeLocalName);

    if (!registryCode || !schemeCode || !propertyTypeLocalName) {
      throw new Error(`Illegal route, registry: '${registryCode}', scheme: '${schemeCode}', propertyTypeLocalName: '${propertyTypeLocalName}'`);
    }

    this.dataService.getPropertyType(propertyTypeLocalName).subscribe(propertyType => {
      this.propertyType = propertyType;
    });

    this.dataService.getCodeScheme(registryCode, schemeCode).subscribe(codeScheme => {
      this.codeScheme = codeScheme;
      this.locationService.atExtensionCreatePage(this.codeScheme, this.title);
    });
  }

  resolveTitle(propertyTypeLocalName: string) {
    if (propertyTypeLocalName === 'calculationHierarchy') {
      this.title = 'Create calculation hierarchy';
    } else if (propertyTypeLocalName === 'definitionHierarchy') {
      this.title = 'Create definition hierarchy';
    } else {
      this.title = 'Create extension';
    }
  }

  get showUnfinishedFeature() {
    return this.env === 'dev' || this.env === 'local';
  }

  get loading(): boolean {
    return !this.env && !this.codeScheme && !this.propertyType;
  }

  back() {
    this.location.back();
  }

  save(formData: any): Observable<any> {

    const { validity, ...rest } = formData;

    const extensionScheme: ExtensionSchemeType = <ExtensionSchemeType> {
      ...rest,
      startDate: formatDate(validity.start),
      endDate: formatDate(validity.end),
      propertyType: this.propertyType.serialize()
    };

    const save = () => {
      console.log('Saving new ExtensionScheme');
      return this.dataService.createExtensionScheme(extensionScheme, this.codeScheme.codeRegistry.codeValue, this.codeScheme.codeValue)
        .pipe(tap(createdExtensionScheme => {
          console.log('Saved new ExtensionScheme');
          this.router.navigate(createdExtensionScheme.route);
        }));
    }

    if (contains(restrictedStatuses, extensionScheme.status)) {
      return from(this.confirmationModalService.openChooseToRestrictedStatus()).pipe(flatMap(save));
    } else {
      return save();
    }
  }

  isCodeValuePatternValid(control: AbstractControl) {
    const isCodeValueValid = control.value.match(/^[a-zA-Z0-9_\-]*$/);
    return !isCodeValueValid ? { 'codeValueValidationError': { value: control.value } } : null;
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
        .pipe(map(exists => exists ? validationError : null));
    };
  }
}
