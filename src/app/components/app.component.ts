import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  styleUrls: ['./app.component.scss'],
  template: `
    <ng-template ngbModalContainer></ng-template>
    <app-navigation-bar></app-navigation-bar>
    <app-breadcrumb></app-breadcrumb>
    <router-outlet></router-outlet>
    <app-footer></app-footer>
  `
})
export class AppComponent {
}
