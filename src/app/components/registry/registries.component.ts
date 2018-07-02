import { EditableService } from '../../services/editable.service';
import { Component, OnInit } from '@angular/core';
import { LanguageService } from '../../services/language.service';
import { CodeRegistry } from '../../entities/code-registry';
import { DataService } from '../../services/data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-code-registries',
  templateUrl: './registries.component.html',
  styleUrls: ['./registries.component.scss'],
  providers: [EditableService],
})
export class RegistriesComponent implements OnInit {

  codeRegistries: CodeRegistry[];

  constructor(private router: Router,
              private dataService: DataService,
              public languageService: LanguageService) {
  }

  ngOnInit() {
    this.dataService.getCodeRegistries().subscribe(codeRegistries => {
      this.codeRegistries = codeRegistries;
    });
  }

  get loading(): boolean {
    return this.codeRegistries == null;
  }

  back() {
    this.router.navigate(['registries']);
  }
}
