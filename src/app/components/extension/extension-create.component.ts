import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { EditableService } from '../../services/editable.service';
import { DataService } from '../../services/data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { ExtensionScheme } from '../../entities/extension-scheme';
import { ExtensionType } from '../../services/api-schema';
import { LanguageService } from '../../services/language.service';
import { LocationService } from '../../services/location.service';

@Component({
  selector: 'app-extension-create',
  templateUrl: './extension-create.component.html',
  styleUrls: ['./extension-create.component.scss'],
  providers: [EditableService]
})
export class ExtensionCreateComponent implements OnInit {

  extensionScheme: ExtensionScheme;

  extensionForm = new FormGroup({
    prefLabel: new FormControl({}),
    extensionValue: new FormControl(''),
    code: new FormControl(null, Validators.required),
    extension: new FormControl(null)
  });

  constructor(private dataService: DataService,
              private route: ActivatedRoute,
              private router: Router,
              private editableService: EditableService,
              private languageService: LanguageService,
              private locationService: LocationService) {

    editableService.onSave = (formValue: any) => this.save(formValue);
    editableService.cancel$.subscribe(() => this.back());
    this.editableService.edit();
  }

  ngOnInit() {
    console.log('ExtensionCreateComponent onInit');
    const registryCodeValue = this.route.snapshot.params.registryCode;
    const schemeCodeValue = this.route.snapshot.params.schemeCode;
    const extensionSchemeCodeValue = this.route.snapshot.params.extensionSchemeCode;

    if (!registryCodeValue || !schemeCodeValue) {
      throw new Error(
        `Illegal route, registry: '${registryCodeValue}', scheme: '${schemeCodeValue}', extensionScheme: '${extensionSchemeCodeValue}'`);
    }

    this.dataService.getExtensionScheme(registryCodeValue, schemeCodeValue, extensionSchemeCodeValue).subscribe(extensionScheme => {
      this.extensionScheme = extensionScheme;
      this.locationService.atExtensionCreatePage(this.extensionScheme);
    });
  }

  back() {
    this.router.navigate(this.extensionScheme.route);
  }

  save(formData: any): Observable<any> {

    console.log('Saving new Extension');

    const { code, currentExtension, ...rest } = formData;

    const extension: ExtensionType = <ExtensionType> {
      ...rest,
      code: code,
      extension: currentExtension
    };

    return this.dataService.createExtension(extension,
      this.extensionScheme.parentCodeScheme.codeRegistry.codeValue,
      this.extensionScheme.parentCodeScheme.codeValue,
      this.extensionScheme.codeValue)
      .do(createdExtension => {
        console.log('Saved new Extension');
        console.log('Saved extension route: ' + createdExtension.route);
        this.router.navigate(createdExtension.route);
      });
  }

  get loading(): boolean {
    return this.extensionScheme == null;
  }

  canSave() {
    return this.extensionForm.valid;
  }

  get requireExtensionValue(): boolean {
    return this.extensionScheme.propertyType.localName === 'calculationHierarchy';
  }
}
