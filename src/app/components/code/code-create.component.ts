import { Component, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Code } from '../../entities/code';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { EditableService } from '../../services/editable.service';
import { Subscription } from 'rxjs/Subscription';
import { DataService } from '../../services/data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { statusList } from '../../entities/status';
import { CodeScheme } from '../../entities/code-scheme';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-code-create',
  templateUrl: './code-create.component.html',
  styleUrls: ['./code-create.component.scss'],
  providers: [EditableService]
})
export class CodeCreateComponent implements OnInit, OnChanges, OnDestroy {

  code: Code;
  codeScheme: CodeScheme;
  registryCode: string;
  schemeId: string;
  startDateValue: NgbDateStruct;
  endDateValue: NgbDateStruct;

  cancelSubscription: Subscription;

  codeForm = new FormGroup({
    codeValue: new FormControl('', Validators.required),
    prefLabel: new FormControl({}),
    description: new FormControl({}),
    shortName: new FormControl('')
  });

  constructor(private dataService: DataService,
              private route: ActivatedRoute,
              private router: Router,
              private editableService: EditableService) {
    this.cancelSubscription = editableService.cancel$.subscribe(() => this.reset());
  }

  ngOnInit() {
    console.log('CodeCreateComponent onInit');
    this.registryCode = this.route.snapshot.params.codeRegistryCodeValue;
    console.log('CodeCreateComponent onInit registryCode: ' + this.registryCode);
    this.schemeId = this.route.snapshot.params.codeSchemeId;
    console.log('CodeCreateComponent onInit schemeId: ' + this.schemeId);

    if (!this.registryCode || !this.schemeId) {
      throw new Error(`Illegal route, registry: '${this.registryCode}', scheme: '${this.schemeId}'`);
    }

    this.dataService.getCodeScheme(this.registryCode, this.schemeId).subscribe(codeScheme => {
      this.codeScheme = codeScheme;
      this.code = new Code();
      this.code.status = 'DRAFT';
      this.editableService.edit();
    });
  }

  back() {
    this.router.navigate(
      ['codescheme',
        {
          codeRegistryCodeValue: this.registryCode,
          codeSchemeId: this.schemeId
        }
      ]
    );
  }

  get statuses(): string[] {
    return statusList;
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

  canSave() {
    return this.codeForm.valid && !this.saving;
  }

  save() {
    console.log('Saving new Code');
    this.editableService.saving$.next(true);
    if (this.startDateValue !== undefined) {
      this.code.startDate = this.startDateValue.year + '-' + this.startDateValue.month + '-' + this.startDateValue.day;
    }
    if (this.endDateValue !== undefined) {
      this.code.endDate = this.endDateValue.year + '-' + this.endDateValue.month + '-' + this.endDateValue.day;
    }
    this.dataService.createCode(Object.assign({}, this.code, this.codeForm.value),
      this.codeScheme.codeRegistry.codeValue, this.codeScheme.id)
      .subscribe(codes => {
        console.log('Saved new Code');
        if (codes.length > 0) {
          this.router.navigate(codes[0].route);
        }
        this.editableService.saving$.next(false);
      }, error => {
        // TODO proper error handling!
        console.log('Error creating Code: ' + error);
        this.editableService.saving$.next(false);
      });
  }

  get loading(): boolean {
    return this.code == null;
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.reset();
  }

  reset() {
    this.codeForm.reset(this.code);
  }

  ngOnDestroy() {
    this.cancelSubscription.unsubscribe();
  }
}
