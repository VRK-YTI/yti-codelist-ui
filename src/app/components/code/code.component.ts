import { Component, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../../services/data.service';
import { Code } from '../../entities/code';
import { ActivatedRoute, Router } from '@angular/router';
import { LocationService } from '../../services/location.service';
import { EditableService, EditingComponent } from '../../services/editable.service';
import { NgbTabChangeEvent, NgbTabset } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationModalService } from '../common/confirmation-modal.component';
import { ignoreModalClose } from '../../utils/modal';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-code',
  templateUrl: './code.component.html',
  styleUrls: ['./code.component.scss'],
  providers: [EditableService]
})
export class CodeComponent implements OnInit, EditingComponent {

  @ViewChild('tabSet') tabSet: NgbTabset;

  code: Code;

  constructor(private dataService: DataService,
              private route: ActivatedRoute,
              private router: Router,
              private locationService: LocationService,
              private editableService: EditableService,
              private confirmationModalService: ConfirmationModalService) {

    editableService.onSave = (formValue: any) => this.save(formValue);
  }

  ngOnInit() {

    const registryCode = this.route.snapshot.params.codeRegistryCodeValue;
    const schemeId = this.route.snapshot.params.codeSchemeId;
    const codeId = this.route.snapshot.params.codeId;

    if (!codeId || !registryCode || !schemeId) {
      throw new Error(`Illegal route, codeId: '${codeId}', registry: '${registryCode}', scheme: '${schemeId}'`);
    }

    this.dataService.getCode(registryCode, schemeId, codeId).subscribe(code => {
      this.code = code;
      this.locationService.atCodePage(code);
    });
  }

  get loading(): boolean {
    return this.code == null;
  }

  onTabChange(event: NgbTabChangeEvent) {

    if (this.isEditing()) {
      event.preventDefault();

      this.confirmationModalService.openEditInProgress()
        .then(() => {
          this.cancelEditing();
          this.tabSet.activeId = event.nextId;
        }, ignoreModalClose);
    }
  }

  back() {
    this.router.navigate(this.code.codeScheme.route);
  }

  isEditing(): boolean {
    return this.editableService.editing;
  }

  cancelEditing(): void {
    this.editableService.cancel();
  }

  save(formData: any): Observable<any> {
    console.log('Store Code changes to server!');

    return this.dataService.saveCode(Object.assign({}, this.code, formData))
      .do(() => this.ngOnInit());
  }
}
