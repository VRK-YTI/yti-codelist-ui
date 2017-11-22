import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { CodeScheme } from '../../entities/code-scheme';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { EditableService } from '../../services/editable.service';
import { ExternalReference } from '../../entities/external-reference';
import { ignoreModalClose } from '../../utils/modal';
import { LinkListModalService } from './link-list-modal.component';
import { LinkShowModalService } from './link-show-modal.component';
import { LinkEditModalService } from './link-edit-modal.component';
import { remove } from '../../utils/array';

@Component({
  selector: 'app-code-scheme-information',
  templateUrl: './code-scheme-information.component.html',
  styleUrls: ['./code-scheme-information.component.scss']
})
export class CodeSchemeInformationComponent implements OnChanges, OnDestroy {

  @Input() codeScheme: CodeScheme;

  codeSchemeForm = new FormGroup({
    prefLabels: new FormControl({}),
    descriptions: new FormControl({}),
    definitions: new FormControl({}),
    source: new FormControl(''),
    legalBase: new FormControl(''),
    governancePolicy: new FormControl(''),
    license: new FormControl('')
  });

  cancelSubscription: Subscription;

  constructor(private linkEditModalService: LinkEditModalService,
              private linkShowModalService: LinkShowModalService,
              private linkListModalService: LinkListModalService,
              private editableService: EditableService) {

    this.cancelSubscription = editableService.cancel$.subscribe(() => this.reset());
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.reset();
  }

  private reset() {
    this.codeSchemeForm.reset(this.codeScheme);
  }

  ngOnDestroy() {
    this.cancelSubscription.unsubscribe();
  }

  get editing() {
    return this.editableService.editing;
  }

  addLink() {

    const restrictIds = this.codeScheme.externalReferences.map(link => link.id);

    this.linkListModalService.open(this.codeScheme.id, restrictIds)
      .then(link => {
        this.codeScheme.addExternalReference(link);
      }, ignoreModalClose);
  }

  editExternalReference(externalReference: ExternalReference) {
    this.linkEditModalService.open(externalReference);
  }

  showExternalReference(externalReference: ExternalReference) {
    this.linkShowModalService.open(externalReference);
  }

  removeExternalReference(externalReference: ExternalReference) {
    remove(this.codeScheme.externalReferences, externalReference);
  }
}
