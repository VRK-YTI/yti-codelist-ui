import { Component, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup, Validators } from '@angular/forms';
import { EditableService } from '../../services/editable.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { restrictedStatuses, Status } from 'yti-common-ui/entities/status';
import { formatDate, validDateRange } from '../../utils/date';
import { ExtensionType } from '../../services/api-schema';
import { from, Observable } from 'rxjs';
import { CodeScheme } from '../../entities/code-scheme';
import { Location } from '@angular/common';
import { LocationService } from '../../services/location.service';
import { flatMap, map, tap } from 'rxjs/operators';
import { PropertyType } from '../../entities/property-type';
import { contains } from 'yti-common-ui/utils/array';
import { CodeListConfirmationModalService } from '../common/confirmation-modal.service';

@Component({
  selector: 'app-extension-create',
  templateUrl: './extension-create.component.html',
  styleUrls: ['./extension-create.component.scss'],
  providers: [EditableService]
})
export class ExtensionCreateComponent implements OnInit {

  codeScheme: CodeScheme;
  codeSchemes: CodeScheme[];
  propertyType: PropertyType;
  title: string;

  maxNrOfCodeSchemes = 1000000; // read: unlimited number of codeschemes

  extensionForm = new FormGroup({
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
  }

  ngOnInit() {
    const registryCode = this.route.snapshot.params.registryCode;
    const schemeCode = this.route.snapshot.params.schemeCode;
    const propertyTypeLocalName = this.route.snapshot.params.propertyTypeLocalName;

    this.resolveTitle(propertyTypeLocalName);

    if (!registryCode || !schemeCode || !propertyTypeLocalName) {
      throw new Error(`Illegal route, registry: '${registryCode}', scheme: '${schemeCode}', propertyTypeLocalName: '${propertyTypeLocalName}'`);
    }

    this.dataService.getCodeScheme(registryCode, schemeCode).subscribe(codeScheme => {
      this.codeScheme = codeScheme;
      this.locationService.atExtensionCreatePage(this.codeScheme, this.title);
      this.loadPropertyType(propertyTypeLocalName);
    });
  }

  loadPropertyType(propertyTypeLocalName: string) {
    this.dataService.getPropertyType(propertyTypeLocalName).subscribe(propertyType => {
      this.propertyType = propertyType;
      if (this.propertyType.localName === 'crossReferenceList') {
        this.maxNrOfCodeSchemes = 2;
      }
      if (this.propertyType.context === 'InlineExtension') {
        this.extensionForm.controls['codeValue'].setValue(this.propertyType.localName);
        this.extensionForm.controls['prefLabel'].setValue(this.propertyType.prefLabel);
      }
    });
  }

  resolveTitle(propertyTypeLocalName: string) {
    if (propertyTypeLocalName === 'calculationHierarchy') {
      this.title = 'Create calculation hierarchy';
    } else if (propertyTypeLocalName === 'definitionHierarchy') {
      this.title = 'Create definition hierarchy';
    } else if (propertyTypeLocalName === 'crossReferenceList') {
      this.title = 'Create cross-reference list';
    } else if (propertyTypeLocalName === 'dpmMetric') {
      this.title = 'Create DPM metric';
    } else if (propertyTypeLocalName === 'dpmExplicitDomain') {
      this.title = 'Create DPM explicit domain';
    } else if (propertyTypeLocalName === 'dpmDimension') {
      this.title = 'Create DPM dimension';
    } else if (propertyTypeLocalName === 'dpmTypedDomain') {
      this.title = 'Create DPM typed domain';
    } else {
      this.title = 'Create extension';
    }
  }

  get loading(): boolean {
    return !this.codeScheme || !this.propertyType;
  }

  back() {
    this.location.back();
  }

  save(formData: any): Observable<any> {

    const { validity, codeSchemes, ...rest } = formData;

    const extension: ExtensionType = <ExtensionType> {
      ...rest,
      startDate: formatDate(validity.start),
      endDate: formatDate(validity.end),
      propertyType: this.propertyType.serialize(),
      codeSchemes: codeSchemes.map((cs: CodeScheme) => cs.serialize())
    };

    const save = () => {
      console.log('Saving new Extension');
      return this.dataService.createExtension(extension, this.codeScheme.codeRegistry.codeValue, this.codeScheme.codeValue)
        .pipe(tap(createdExtension => {
          console.log('Saved new Extension');
          this.router.navigate(createdExtension.route);
        }));
    };

    if (contains(restrictedStatuses, extension.status)) {
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
      const extensionCodeValue = control.value.codeValue;
      const validationError = {
        extensionCodeValueExists: {
          valid: false
        }
      };
      return this.dataService.extensionCodeValueExists(registryCodeValue, schemeCodeValue, extensionCodeValue)
        .pipe(map(exists => exists ? validationError : null));
    };
  }

  get allowCodeSchemes(): boolean {
    return this.propertyType.context === 'Extension';
  }

  get isInlineExtension(): boolean {
    return this.propertyType.context === 'InlineExtension';
  }
}
