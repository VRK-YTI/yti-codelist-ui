import { Component, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup, Validators } from '@angular/forms';
import { EditableService } from '../../services/editable.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { CodeRegistryType } from '../../services/api-schema';
import { Observable } from 'rxjs';
import { TerminologyIntegrationModalService } from '../terminology-integration/terminology-integration-codescheme-modal.component';
import { Location } from '@angular/common';
import { LocationService } from '../../services/location.service';
import { Organization } from '../../entities/organization';
import { map, tap } from 'rxjs/operators';
import { requiredList } from 'yti-common-ui/utils/validator';

@Component({
  selector: 'app-registry-create',
  templateUrl: './registry-create.component.html',
  styleUrls: ['./registry-create.component.scss'],
  providers: [EditableService]
})
export class RegistryCreateComponent implements OnInit {

  codeRegistryForm = new FormGroup({
    codeValue: new FormControl('', [Validators.required, this.isCodeValuePatternValid]),
    prefLabel: new FormControl({}),
    description: new FormControl({}),
    organizations: new FormControl([], [requiredList])
  }, null, this.codeValueExistsValidator());

  constructor(private router: Router,
              private dataService: DataService,
              private editableService: EditableService,
              private terminologyIntegrationModalService: TerminologyIntegrationModalService,
              private activatedRoute: ActivatedRoute,
              private location: Location,
              private locationService: LocationService) {

    editableService.onSave = (formValue: any) => this.save(formValue);
    editableService.cancel$.subscribe(() => this.back());
    this.editableService.edit();
  }

  ngOnInit() {

    this.locationService.atRegistryCreatePage();
  }

  back() {
    this.location.back();
  }

  save(formData: any): Observable<any> {

    const { organizations, ...rest } = formData;

    const codeRegistry: CodeRegistryType = <CodeRegistryType> {
      ...rest,
      organizations: organizations.map((organization: Organization) => organization.serialize())
    };

    return this.dataService.createRegistry(codeRegistry)
      .pipe(tap(createdRegistry => {
        this.router.navigate(createdRegistry.route);
      }));
  }

  isCodeValuePatternValid(control: AbstractControl) {
    const isCodeValueValid = control.value.match(/^[a-zA-Z0-9_\-]*$/);
    return !isCodeValueValid ? { 'codeValueValidationError': { value: control.value } } : null;
  }

  codeValueExistsValidator(): AsyncValidatorFn {
    return (control: AbstractControl) => {
      const registryCode = control.value.codeValue ? control.value.codeValue : '';
      const validationError = {
        registryCodeValueExists: {
          valid: false
        }
      };
      return this.dataService.registryCodeValueExists(registryCode)
        .pipe(map(exists => exists ? validationError : null));
    };
  }
}
