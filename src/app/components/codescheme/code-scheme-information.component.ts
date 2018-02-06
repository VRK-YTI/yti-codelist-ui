import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { CodeScheme } from '../../entities/code-scheme';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { EditableService } from '../../services/editable.service';
import { LinkListModalService } from './link-list-modal.component';
import { LinkShowModalService } from './link-show-modal.component';
import { LinkEditModalService } from './link-edit-modal.component';
import { contains, normalizeAsArray } from 'yti-common-ui/utils/array';
import { CodeListConfirmationModalService } from '../common/confirmation-modal.service';
import { restrictedStatuses } from 'yti-common-ui/entities/status';
import { Code } from '../../entities/code';
import { DataService } from '../../services/data.service';
import { toPickerDate } from '../../utils/date';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-code-scheme-information',
  templateUrl: './code-scheme-information.component.html',
  styleUrls: ['./code-scheme-information.component.scss']
})
export class CodeSchemeInformationComponent implements OnChanges, OnDestroy, OnInit {

  @Input() codeScheme: CodeScheme;

  dataClassifications: Code[];

  codeSchemeForm = new FormGroup({
    prefLabel: new FormControl({}),
    description: new FormControl({}),
    changeNote: new FormControl({}),
    definition: new FormControl({}),
    source: new FormControl(''),
    legalBase: new FormControl(''),
    governancePolicy: new FormControl(''),
    externalReferences: new FormControl(),
    dataClassifications: new FormControl(),
    startDate: new FormControl(),
    endDate: new FormControl(),
    status: new FormControl()
  });

  cancelSubscription: Subscription;

  constructor(private linkEditModalService: LinkEditModalService,
              private linkShowModalService: LinkShowModalService,
              private linkListModalService: LinkListModalService,
              private confirmationModalService: CodeListConfirmationModalService,
              private editableService: EditableService,
              private dataService: DataService,
              public languageService: LanguageService) {

    this.cancelSubscription = editableService.cancel$.subscribe(() => this.reset());
  }

  ngOnInit() {
    this.dataService.getDataClassificationsAsCodes().subscribe(dataClassifications => {
      this.dataClassifications = dataClassifications;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.reset();
  }

  private reset() {
    const { externalReferences, startDate, endDate, ...rest } = this.codeScheme;

    this.codeSchemeForm.reset({
      ...rest,
      externalReferences: externalReferences.map(link => link.clone()),
      startDate: toPickerDate(startDate),
      endDate: toPickerDate(endDate)
    });
  }

  ngOnDestroy() {
    this.cancelSubscription.unsubscribe();
  }

  get editing() {
    return this.editableService.editing;
  }

  get restricted(): boolean {
    return contains(restrictedStatuses, this.codeScheme.status);
  }

  isClassificationSelected(code: Code) {
    return this.dataClassification === code;
  }

  get dataClassification(): Code|null {
    const current = normalizeAsArray(this.dataClassificationsControl.value);
    return current.length > 0 ? current[0] : null;
  }

  setDataClassification(dataClassification: Code) {
    this.dataClassificationsControl.setValue([dataClassification]);
  }

  private get dataClassificationsControl() {

    const dcControl = this.codeSchemeForm.get('dataClassifications');

    if (dcControl == null) {
      throw new Error('Form control not found');
    }

    return dcControl;
  }
}
