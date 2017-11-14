import { Component } from '@angular/core';

// TODO remove this component after testing is done
@Component({
  selector: 'app-style-test',
  template: `
    <div class="content-box">

      <h2>Small - enabled</h2>

      <div class="row pb-2">
        <div class="col-12">
          <button class="btn btn-action btn-sm">Primary action</button>

          <div ngbDropdown class="d-inline-block">
            <button class="btn btn-action btn-sm" ngbDropdownToggle>Action dropdown</button>
            <div ngbDropdownMenu>
              <button *ngFor="let a of actions"
                      class="dropdown-item">{{a}}</button>
            </div>
          </div>

          <button class="btn btn-secondary-action btn-sm">Secondary action</button>
          
          <div ngbDropdown class="d-inline-block">
            <button class="btn btn-dropdown btn-sm" ngbDropdownToggle>{{dropValue}}</button>
            <div ngbDropdownMenu>
              <button *ngFor="let val of dropValues"
                      (click)="dropValue = val"
                      class="dropdown-item"
                      [class.active]="val == dropValue">{{val}}</button>
            </div>
          </div>

          <button class="btn btn-link btn-sm">Cancel / Delete action</button>

          <div ngbDropdown class="d-inline-block">
            <button class="btn btn-language btn-sm" ngbDropdownToggle>{{language}}</button>
            <div ngbDropdownMenu>
              <button *ngFor="let lang of languages"
                      (click)="language = lang"
                      class="dropdown-item"
                      [class.active]="lang == language">{{lang}}</button>
            </div>
          </div>
        </div>
      </div>

      <h2>Small - disabled</h2>

      <div class="row pb-2">
        <div class="col-12">
          <button class="btn btn-action btn-sm" disabled>Primary action</button>

          <div ngbDropdown class="d-inline-block">
            <button class="btn btn-action btn-sm" disabled ngbDropdownToggle>Action dropdown</button>
            <div ngbDropdownMenu>
              <button *ngFor="let a of actions"
                      class="dropdown-item">{{a}}</button>
            </div>
          </div>

          <button class="btn btn-secondary-action btn-sm" disabled>Secondary action</button>

          <div ngbDropdown class="d-inline-block">
            <button class="btn btn-dropdown btn-sm" disabled ngbDropdownToggle>{{dropValue}}</button>
            <div ngbDropdownMenu>
              <button *ngFor="let val of dropValues"
                      (click)="dropValue = val"
                      class="dropdown-item"
                      [class.active]="val == dropValue">{{val}}</button>
            </div>
          </div>

          <button class="btn btn-link btn-sm" disabled>Cancel / Delete action</button>

          <div ngbDropdown class="d-inline-block">
            <button class="btn btn-language btn-sm" disabled ngbDropdownToggle>{{language}}</button>
            <div ngbDropdownMenu>
              <button *ngFor="let lang of languages"
                      (click)="language = lang"
                      class="dropdown-item"
                      [class.active]="lang == language">{{lang}}</button>
            </div>
          </div>
        </div>
      </div>

      <h2>Normal - enabled</h2>

      <div class="row pb-2">
        <div class="col-12">
          <button class="btn btn-action">Primary action</button>

          <div ngbDropdown class="d-inline-block">
            <button class="btn btn-action" ngbDropdownToggle>Action dropdown</button>
            <div ngbDropdownMenu>
              <button *ngFor="let a of actions"
                      class="dropdown-item">{{a}}</button>
            </div>
          </div>

          <button class="btn btn-secondary-action">Secondary action</button>

          <div ngbDropdown class="d-inline-block">
            <button class="btn btn-dropdown" ngbDropdownToggle>{{dropValue}}</button>
            <div ngbDropdownMenu>
              <button *ngFor="let val of dropValues"
                      (click)="dropValue = val"
                      class="dropdown-item"
                      [class.active]="val == dropValue">{{val}}</button>
            </div>
          </div>
          
          <button class="btn btn-link">Cancel / Delete action</button>
          
          <div ngbDropdown class="d-inline-block">
            <button class="btn btn-language" ngbDropdownToggle>{{language}}</button>
            <div ngbDropdownMenu>
              <button *ngFor="let lang of languages"
                      (click)="language = lang"
                      class="dropdown-item"
                      [class.active]="lang == language">{{lang}}</button>
            </div>
          </div>
        </div>
      </div>

      <h2>Normal - disabled</h2>

      <div class="row pb-2">
        <div class="col-12">
          <button class="btn btn-action" disabled>Primary action</button>

          <div ngbDropdown class="d-inline-block">
            <button class="btn btn-action" disabled ngbDropdownToggle>Action dropdown</button>
            <div ngbDropdownMenu>
              <button *ngFor="let a of actions"
                      class="dropdown-item">{{a}}</button>
            </div>
          </div>

          <button class="btn btn-secondary-action" disabled>Secondary action</button>

          <div ngbDropdown class="d-inline-block">
            <button class="btn btn-dropdown" disabled ngbDropdownToggle>{{dropValue}}</button>
            <div ngbDropdownMenu>
              <button *ngFor="let val of dropValues"
                      (click)="dropValue = val"
                      class="dropdown-item"
                      [class.active]="val == dropValue">{{val}}</button>
            </div>
          </div>

          <button class="btn btn-link" disabled>Cancel / Delete action</button>

          <div ngbDropdown class="d-inline-block">
            <button class="btn btn-language" disabled ngbDropdownToggle>{{language}}</button>
            <div ngbDropdownMenu>
              <button *ngFor="let lang of languages"
                      (click)="language = lang"
                      class="dropdown-item"
                      [class.active]="lang == language">{{lang}}</button>
            </div>
          </div>
        </div>
      </div>      

      <h2>Large - enabled</h2>
      
      <div class="row pb-2">
        <div class="col-12">
          <button class="btn btn-action btn-lg">Primary action</button>

          <div ngbDropdown class="d-inline-block">
            <button class="btn btn-action btn-lg" ngbDropdownToggle>Action dropdown</button>
            <div ngbDropdownMenu>
              <button *ngFor="let a of actions"
                      class="dropdown-item">{{a}}</button>
            </div>
          </div>

          <button class="btn btn-secondary-action btn-lg">Secondary action</button>

          <div ngbDropdown class="d-inline-block">
            <button class="btn btn-dropdown btn-lg" ngbDropdownToggle>{{dropValue}}</button>
            <div ngbDropdownMenu>
              <button *ngFor="let val of dropValues"
                      (click)="dropValue = val"
                      class="dropdown-item"
                      [class.active]="val == dropValue">{{val}}</button>
            </div>
          </div>
          
          <button class="btn btn-link">Cancel / Delete action</button>

          <div ngbDropdown class="d-inline-block">
            <button class="btn btn-language btn-lg" ngbDropdownToggle>{{language}}</button>
            <div ngbDropdownMenu>
              <button *ngFor="let lang of languages"
                      (click)="language = lang"
                      class="dropdown-item"
                      [class.active]="lang == language">{{lang}}</button>
            </div>
          </div>

        </div>
      </div>
      
      <h2>Large - disabled</h2>

      <button class="btn btn-action btn-lg" disabled>Primary action</button>

      <div ngbDropdown class="d-inline-block">
        <button class="btn btn-action btn-lg" disabled ngbDropdownToggle>Action dropdown</button>
        <div ngbDropdownMenu>
          <button *ngFor="let a of actions"
                  class="dropdown-item">{{a}}</button>
        </div>
      </div>
      
      <button class="btn btn-secondary-action btn-lg" disabled>Secondary action</button>
      
      <div ngbDropdown class="d-inline-block">
        <button class="btn btn-dropdown btn-lg" disabled ngbDropdownToggle>{{dropValue}}</button>
        <div ngbDropdownMenu>
          <button *ngFor="let val of dropValues"
                  (click)="dropValue = val"
                  class="dropdown-item"
                  [class.active]="val == dropValue">{{val}}</button>
        </div>
      </div>
      
      <button class="btn btn-link" disabled>Disabled cancel / Delete action</button>

      <div ngbDropdown class="d-inline-block">
        <button class="btn btn-language btn-lg" disabled ngbDropdownToggle>{{language}}</button>
        <div ngbDropdownMenu>
          <button *ngFor="let lang of languages"
                  (click)="language = lang"
                  class="dropdown-item"
                  [class.active]="lang == language">{{lang}}</button>
        </div>
      </div>
    </div>
  `
})
export class StyleTestComponent {

  languages = ['FI', 'SV', 'EN'];
  language = this.languages[0];

  actions = ['Do this', 'Do that', 'Something else'];

  dropValues = ['Foo', 'Bar', 'Baz'];
  dropValue = this.dropValues[0];
}
