import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ExternalReference } from '../../entities/external-reference';
import { EditableService, EditingComponent } from '../../services/editable.service';
import { FormControl, FormGroup } from '@angular/forms';
import { PropertyType } from '../../entities/property-type';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-link-modal',
  templateUrl: './link-modal.component.html',
  providers: [EditableService]
})
export class LinkModalComponent implements EditingComponent, OnChanges, OnInit {

  @Input() link: ExternalReference;
  @Input() isCreating: boolean;
  @Input() enableEdit: boolean;
  initialized: boolean;
  propertyTypes: PropertyType[];
  propertyType: PropertyType;

  linkForm = new FormGroup({
    titles: new FormControl({}),
    descriptions: new FormControl({}),
    url: new FormControl('')
  });

  constructor(private dataService: DataService,
              private editableService: EditableService,
              private modal: NgbActiveModal) {
  }

  ngOnInit() {
    this.dataService.getPropertyTypes('ExternalReference').subscribe(types => {
      this.propertyTypes = types;
      if (this.link.propertyType !== undefined) {
        this.propertyType = this.link.propertyType;
      } else if (this.propertyTypes !== undefined && this.propertyTypes.length > 0) {
        this.propertyType = this.propertyTypes[0];
        this.link.propertyType = this.propertyType;
      } else {
        console.log('Issue with PropertyType not being set!');
      }
      this.linkForm.reset(this.link);
      if (this.enableEdit) {
        this.editableService.edit();
      }
      this.initialized = true;
    });
  }

  get initializing(): boolean {
    return this.propertyTypes == null && this.initialized;
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.linkForm.reset(this.link);
  }

  isEditing(): boolean {
    return this.editableService.editing;
  }

  cancelEditing(): void {
    this.editableService.cancel();
  }

  close() {
    this.modal.dismiss('cancel');
  }

  add() {
    this.link.propertyType = this.propertyType;
    this.modal.close(Object.assign({}, this.link, this.linkForm.value));
  }

  save() {
    this.link.propertyType = this.propertyType;
    this.modal.close(Object.assign({}, this.link, this.linkForm.value));
  }
}
