import { Component, Input } from '@angular/core';
import { EditableService } from '../../services/editable.service';
import { NgForm } from '@angular/forms';
import { AuthorizationManager } from '../../services/authorization-manager.service';
import { EditableEntity } from '../../entities/editable-entity';

@Component({
  selector: 'app-editable-buttons',
  template: `
    <button id="editable_save_button"
            [hidden]="!editing"
            type="button"
            [disabled]="!canSave() || operationPending || invalid" 
            class="btn btn-action pull-right ml-3" 
            (click)="save()" translate>Save</button>
    
    <button id="editable_cancel_button"
            [hidden]="!editing"
            type="button" 
            [disabled]="operationPending"
            class="btn btn-link pull-right" 
            (click)="cancel()" 
            translate>Cancel</button>
    
    <button id="editable_edit_button"
            [hidden]="editing"
            type="button" 
            class="btn btn-action pull-right ml-3"
            *ngIf="canEdit()"
            (click)="edit()" translate>Edit</button>
    
    <app-ajax-loading-indicator-small class="pull-right" *ngIf="operationPending"></app-ajax-loading-indicator-small>
  `
})
export class EditableButtonsComponent {

  @Input() form: NgForm;
  @Input() entity: EditableEntity;

  constructor(private editableService: EditableService,
              private authorizationManager: AuthorizationManager) {
  }

  get invalid() {
    const invalid = this.form.invalid || false;
    const pending = this.form.pending || false;
    return invalid || pending;
  }

  edit() {
    this.editableService.edit();
  }

  save() {
    this.editableService.save(this.form.form.value);
  }

  cancel() {
    this.editableService.cancel();
  }

  canEdit(): boolean {
    if (!this.entity) {
      return true;
    } else {
      return this.authorizationManager.canEdit(this.entity);
    }
  }

  canSave() {
    return !this.form.invalid && !this.form.pending;
  }

  get operationPending() {
    return this.saving;
  }

  get editing() {
    return this.editableService.editing;
  }

  get saving() {
    return this.editableService.saving;
  }
}
