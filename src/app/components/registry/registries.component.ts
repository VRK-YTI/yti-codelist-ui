import { EditableService } from '../../services/editable.service';
import { Component, OnInit } from '@angular/core';
import { LanguageService } from '../../services/language.service';
import { CodeRegistry } from '../../entities/code-registry';
import { DataService } from '../../services/data.service';
import { Router } from '@angular/router';
import { LocationService } from '../../services/location.service';
import { UserService } from 'yti-common-ui/services/user.service';

@Component({
  selector: 'app-code-registries',
  templateUrl: './registries.component.html',
  styleUrls: ['./registries.component.scss'],
  providers: [EditableService],
})
export class RegistriesComponent implements OnInit {

  codeRegistries: CodeRegistry[];

  constructor(public languageService: LanguageService,
              private router: Router,
              private dataService: DataService,
              private locationService: LocationService,
              private userService: UserService) {
  }

  ngOnInit() {
    this.locationService.atCodeRegistriesPage();
    this.dataService.getCodeRegistries().subscribe(codeRegistries => {
      this.codeRegistries = codeRegistries;
    });
  }

  get loading(): boolean {
    return this.codeRegistries == null;
  }

  canAddRegistry() {
    return this.userService.user.superuser;
  }

  createRegistry() {
    this.router.navigate(['createregistry']);  }

  back() {
    this.router.navigate(['frontpage']);
  }
}
