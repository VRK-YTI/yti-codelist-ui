import { Component, OnInit, AfterViewInit } from '@angular/core';
import { AsyncValidatorFn, AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { EditableService } from '../../services/editable.service';
import { DataService } from '../../services/data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { formatDate, validDateRange } from '../../utils/date';
import { CodeScheme } from '../../entities/code-scheme';
import { CodeType } from '../../services/api-schema';
import { Status } from 'yti-common-ui/entities/status';
import { Observable } from 'rxjs/Observable';
import {TerminologyIntegrationModalService} from '../terminology-integration/terminology-integration-codescheme-modal.component';
import {ignoreModalClose} from 'yti-common-ui/utils/modal';
import {Concept} from '../../entities/concept';

@Component({
  selector: 'app-code-create',
  templateUrl: './code-create.component.html',
  styleUrls: ['./code-create.component.scss'],
  providers: [EditableService]
})
export class CodeCreateComponent implements OnInit, AfterViewInit {

  codeScheme: CodeScheme;
  env: string;

  codeForm = new FormGroup({
    codeValue: new FormControl('', [Validators.required, this.isCodeValuePatternValid], this.codeValueExistsValidator()),
    prefLabel: new FormControl({}),
    description: new FormControl({}),
    definition: new FormControl({}),
    shortName: new FormControl(''),
    validity: new FormControl({ start: null, end: null }, validDateRange),
    status: new FormControl('DRAFT' as Status),
    conceptUriInVocabularies: new FormControl('')
  });

  constructor(private dataService: DataService,
              private route: ActivatedRoute,
              private router: Router,
              private editableService: EditableService,
              private terminologyIntegrationModalService: TerminologyIntegrationModalService) {

    editableService.onSave = (formValue: any) => this.save(formValue);
    editableService.cancel$.subscribe(() => this.back());
    this.editableService.edit();

    dataService.getServiceConfiguration().subscribe(configuration => {
      this.env = configuration.env;
    });
  }

  ngOnInit() {
    console.log('CodeCreateComponent onInit');
    const registryCode = this.route.snapshot.params.registryCode;
    console.log('CodeCreateComponent onInit registryCode: ' + registryCode);
    const schemeCode = this.route.snapshot.params.schemeCode;
    console.log('CodeCreateComponent onInit schemeCode: ' + schemeCode);

    if (!registryCode || !schemeCode) {
      throw new Error(`Illegal route, registry: '${registryCode}', scheme: '${schemeCode}'`);
    }

    this.dataService.getCodeScheme(registryCode, schemeCode).subscribe(codeScheme => {
      this.codeScheme = codeScheme;
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.openTerminologyModal();
    });
  }

  back() {
    this.router.navigate(this.codeScheme.route);
  }

  save(formData: any): Observable<any> {

    console.log('Saving new Code');

    const { validity, ...rest } = formData;

    const code: CodeType = <CodeType> {
      ...rest,
      startDate: formatDate(validity.start),
      endDate: formatDate(validity.end)
    };

    return this.dataService.createCode(code, this.codeScheme.codeRegistry.codeValue, this.codeScheme.codeValue)
      .do(createdCode => {
        console.log('Saved new Code');
        console.log('Saved code route: ' + createdCode.route);
        this.router.navigate(createdCode.route);
      });
  }

  get loading(): boolean {
    return this.codeScheme == null;
  }

  isCodeValuePatternValid (control: AbstractControl) {
    const isCodeValueValid = control.value.match(/^[a-zA-Z0-9_\-\.]*$/);
    return !isCodeValueValid ? {'codeCodeValueValidationError': {value: control.value}} : null;
  }

  codeValueExistsValidator(): AsyncValidatorFn {
    return (control: AbstractControl) => {
      const registryCode = this.codeScheme.codeRegistry.codeValue ? this.codeScheme.codeRegistry.codeValue : '';
      const schemeCode = this.codeScheme.codeValue;
      const validationError = {
        codeValueExists: {
          valid: false
        }
      };
      return this.dataService.codeCodeValueExists(registryCode, schemeCode, control.value)
        .map(exists => exists ? validationError : null);
    };
  }

  openTerminologyModal() {
    this.terminologyIntegrationModalService.open(false).then(concept => this.putConceptStuffInPlace(concept), ignoreModalClose);
  }

  removeConceptUriInVocabularies() {
    this.codeForm.controls['conceptUriInVocabularies'].setValue('');
  }

  putConceptStuffInPlace(concept: Concept) {
    this.codeForm.patchValue({prefLabel: concept.prefLabel});
    this.codeForm.patchValue({definition: concept.definition});
    this.codeForm.patchValue({conceptUriInVocabularies: concept.uri});
  }

  get showUnfinishedFeature() {
    return this.env === 'dev';
  }
}
