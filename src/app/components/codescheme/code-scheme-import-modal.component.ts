import { Component, Injectable, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EditableService } from '../../services/editable.service';
import { DataService } from '../../services/data.service';
import { CodeRegistry } from '../../entities/code-registry';
import { Router } from '@angular/router';
import { ErrorModalService } from 'yti-common-ui/components/error-modal.component';

@Injectable()
export class CodeSchemeImportModalService {

  constructor(private modalService: NgbModal) {
  }

  public open(): Promise<boolean> {
    const modalRef = this.modalService.open(CodeSchemeImportModalComponent, {size: 'sm'});
    return modalRef.result;
  }
}

@Component({
  selector: 'app-code-scheme-import-modal',
  templateUrl: './code-scheme-import-modal.component.html',
  providers: [EditableService]
})
export class CodeSchemeImportModalComponent implements OnInit {

  codeRegistries: CodeRegistry[];
  codeRegistry?: CodeRegistry;
  file?: File;
  format = 'CSV';

  constructor(private editableService: EditableService,
              private dataService: DataService,
              private router: Router,
              private modal: NgbActiveModal,
              private errorModalService: ErrorModalService) {

    this.editableService.edit();
  }

  get loading(): boolean {
    return this.codeRegistries === undefined;
  }

  ngOnInit() {
    this.dataService.getCodeRegistriesForUser().subscribe(registers => {
      this.codeRegistries = registers;
    });
  }

  close() {
    this.modal.dismiss('cancel');
  }

  canSave() {
    return this.codeRegistry !== undefined && this.file !== undefined;
  }

  onChange(event: EventTarget) {
    const eventObj: MSInputMethodContext = <MSInputMethodContext> event;
    const target: HTMLInputElement = <HTMLInputElement> eventObj.target;
    if (target.files != null) {
      this.file = target.files[0];
    } else {
      this.file = undefined;
    }
    console.log(this.file);
  }

  uploadFile() {
    if (this.file !== undefined && this.codeRegistry !== undefined) {
      this.dataService.uploadCodeSchemes(this.codeRegistry.codeValue, this.file, this.format).subscribe(codeSchemes => {
        if (codeSchemes.length > 0) {
          this.router.navigate(codeSchemes[0].route);
          this.modal.close(false);
        }
      }, error => {
        this.errorModalService.openSubmitError();
      });
    }
  }
}
