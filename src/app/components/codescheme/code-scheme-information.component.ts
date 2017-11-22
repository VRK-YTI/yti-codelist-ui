import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { CodeScheme } from '../../entities/code-scheme';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { EditableService } from '../../services/editable.service';
import { ExternalReference } from '../../entities/external-reference';
import { ignoreModalClose } from '../../utils/modal';
import { LinkListModalService } from './link-list-modal.component';
import { LinkShowModalService } from './link-show-modal.component';
import { LinkCreateModalService } from './link-create-modal.component';
import { LinkEditModalService } from './link-edit-modal.component';

@Component({
  selector: 'app-code-scheme-information',
  templateUrl: './code-scheme-information.component.html',
  styleUrls: ['./code-scheme-information.component.scss']
})
export class CodeSchemeInformationComponent implements OnChanges, OnDestroy {

  @Input() codeScheme: CodeScheme;
  @Input() externalReferences: ExternalReference[];

  cancelSubscription: Subscription;

  codeSchemeForm = new FormGroup({
    prefLabels: new FormControl({}),
    descriptions: new FormControl({}),
    definitions: new FormControl({}),
    source: new FormControl(''),
    legalBase: new FormControl(''),
    governancePolicy: new FormControl(''),
    license: new FormControl('')
  });

  constructor(private linkEditModalService: LinkEditModalService,
              private linkCreateModalService: LinkCreateModalService,
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

    // FIXME: what is this logic?
    if (this.externalReferences === undefined
        || this.externalReferences.length === 0
        || this.externalReferences.length === this.codeScheme.externalReferences.length) {
      this.openCreate();
    } else {
      this.openList(this.externalReferences);
    }
  }

  openList(externalReferences: ExternalReference[]) {
    // TODO: filter only not used externalReferences to be shown as list.
    this.linkListModalService.open(externalReferences)
      .then(link => {
        console.log('openList callback with success');
        const addedLink: ExternalReference = Object.assign(new ExternalReference(), link);
        this.codeScheme.addExternalReference(addedLink);
      })
      .catch((reason) => {
        console.log('openList callback with reason: ' + reason);
        if (reason === 'create') {
          this.openCreate();
        } else {
          ignoreModalClose(reason);
        }
      });
  }

  openCreate() {
    this.linkCreateModalService.open()
      .then(link => {

        const addedLink: ExternalReference = Object.assign(new ExternalReference(), link);

        if (link.id === undefined) {
          if (addedLink.id === undefined) {
            this.codeScheme.addExternalReference(addedLink);
          } else {
            this.codeScheme.replaceExternalReference(addedLink);
          }
        }

      }, ignoreModalClose);
  }

  editExternalReference(externalReference: ExternalReference) {
    this.linkEditModalService.open(externalReference).then(link => {
      const addedLink: ExternalReference = Object.assign(new ExternalReference(), link);
      this.codeScheme.addExternalReference(addedLink);
    }, ignoreModalClose);
  }

  showExternalReference(externalReference: ExternalReference) {
    this.linkShowModalService.open(externalReference);
  }

  removeExternalReference(externalReference: ExternalReference) {
    if (this.codeScheme.externalReferences !== undefined) {
      this.codeScheme.externalReferences = this.codeScheme.externalReferences.filter(obj => obj.url !== externalReference.url);
    }
  }
}
