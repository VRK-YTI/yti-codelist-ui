import { Component, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Code } from '../../entities/code';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { EditableService } from '../../services/editable.service';
import { Subscription } from 'rxjs/Subscription';
import { DataService } from '../../services/data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { selectableStatuses } from 'yti-common-ui/entities/status';
import { CodeScheme } from '../../entities/code-scheme';
import { fromPickerDate } from '../../utils/date';

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

  cancelSubscription: Subscription;

  codeForm = new FormGroup({
    codeValue: new FormControl('', Validators.required),
    prefLabel: new FormControl({}),
    description: new FormControl({}),
    shortName: new FormControl(''),
    startDate: new FormControl(),
    endDate: new FormControl()
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
    return selectableStatuses;
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

    const { startDate, endDate, ...rest } = this.codeForm.value;

    this.dataService.createCode(Object.assign({}, this.code, rest, {
      startDate: fromPickerDate(startDate),
      endDate: fromPickerDate(endDate)
    }), this.codeScheme.codeRegistry.codeValue, this.codeScheme.id)
      .subscribe(codes => {
        console.log('Saved new Code');
        if (codes.length > 0) {
          this.router.navigate([
            'code',
            {
              codeRegistryCodeValue: this.registryCode,
              codeSchemeId: this.schemeId,
              codeId: codes[0].id
            }
          ]);
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
