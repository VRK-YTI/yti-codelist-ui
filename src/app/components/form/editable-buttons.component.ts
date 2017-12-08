import { Component, Input } from '@angular/core';
import { EditableService } from '../../services/editable.service';
import { NgForm } from '@angular/forms';
import { AuthorizationManager } from '../../services/authorization-manager.service';
import { Organization } from '../../entities/organization';

@Component({
  selector: 'app-editable-buttons',
  template: `
    <button [hidden]="!editing" 
            type="button"
            [disabled]="!canSave() || operationPending" 
            class="btn btn-action pull-right ml-3" 
            (click)="save()" translate>Save</button>
    
    <button [hidden]="!editing" 
            type="button" 
            [disabled]="operationPending"
            class="btn btn-link pull-right" 
            (click)="cancel()" 
            translate>Cancel</button>
    
    <button [hidden]="editing" 
            type="button" 
            class="btn btn-action pull-right ml-3"
            *ngIf="canEdit()"
            (click)="edit()" translate>Edit</button>
    
    <app-ajax-loading-indicator-small class="pull-right" *ngIf="operationPending"></app-ajax-loading-indicator-small>
  `
})
export class EditableButtonsComponent {

  @Input() form: NgForm;
  @Input() organizations: Organization[];


  constructor(private editableService: EditableService,
              private authorizationManager: AuthorizationManager) {
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
    return this.authorizationManager.canEdit(this.organizations);
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
