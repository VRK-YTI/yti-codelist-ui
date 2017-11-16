import { Component, OnInit, ViewChild } from '@angular/core';
import { CodeScheme } from '../../entities/code-scheme';
import { DataService } from '../../services/data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Code } from '../../entities/code';
import { LocationService } from '../../services/location.service';
import { EditableService, EditingComponent } from '../../services/editable.service';
import { NgbTabChangeEvent, NgbTabset } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationModalService } from '../common/confirmation-modal.component';
import { ignoreModalClose } from '../../utils/modal';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-code-scheme',
  templateUrl: './code-scheme.component.html',
  styleUrls: ['./code-scheme.component.scss'],
  providers: [EditableService]
})
export class CodeSchemeComponent implements OnInit, EditingComponent {

  @ViewChild('tabSet') tabSet: NgbTabset;

  codeScheme: CodeScheme;
  codes: Code[];

  constructor(private dataService: DataService,
              private route: ActivatedRoute,
              private router: Router,
              private locationService: LocationService,
              private editableService: EditableService,
              private confirmationModalService: ConfirmationModalService) {

    editableService.onSave = (formValue: any) => this.save(formValue);
    editableService.onCanceled = () => this.cancel();
  }

  ngOnInit() {

    const registryCode = this.route.snapshot.params.codeRegistryCodeValue;
    const schemeCode = this.route.snapshot.params.codeSchemeCodeValue;

    if (!registryCode || !schemeCode) {
      throw new Error(`Illegal route, registry: '${registryCode}', scheme: '${schemeCode}'`);
    }

    this.dataService.getCodeScheme(registryCode, schemeCode).subscribe(codeScheme => {
      this.codeScheme = codeScheme;
      this.locationService.atCodeSchemePage(codeScheme);
    });

    this.dataService.getCodes(registryCode, schemeCode).subscribe(codes => {
      this.codes = codes;
    });
  }

  get loading(): boolean {
    return this.codeScheme == null || this.codes == null;
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
    this.router.navigate(['frontpage']);
  }

  isEditing(): boolean {
    return this.editableService.editing;
  }

  cancelEditing(): void {
    this.editableService.cancel();
  }

  save(formData: any): Observable<any> {

    console.log('Store CodeScheme changes to server!');
    return this.dataService.saveCodeScheme(Object.assign({}, this.codeScheme, formData))
      .do(() => this.ngOnInit());
  }

  cancel() {
  }
}
