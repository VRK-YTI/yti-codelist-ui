import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { CodeScheme } from '../../entities/code-scheme';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { EditableService } from '../../services/editable.service';
import { LinkListModalService } from './link-list-modal.component';
import { LinkShowModalService } from './link-show-modal.component';
import { LinkEditModalService } from './link-edit-modal.component';
import { contains } from 'yti-common-ui/utils/array';
import { CodeListConfirmationModalService } from '../common/confirmation-modal.service';
import { restrictedStatuses } from 'yti-common-ui/entities/status';
import { Code } from '../../entities/code';
import { toPickerDate } from '../../utils/date';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-code-scheme-information',
  templateUrl: './code-scheme-information.component.html',
  styleUrls: ['./code-scheme-information.component.scss']
})
export class CodeSchemeInformationComponent implements OnChanges, OnDestroy {

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
              public languageService: LanguageService) {

    this.cancelSubscription = editableService.cancel$.subscribe(() => this.reset());
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
}
