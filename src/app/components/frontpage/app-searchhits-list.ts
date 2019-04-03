import { Component, Input } from '@angular/core';
import { SearchHit } from '../../entities/search-hit';
import { ConfigurationService } from '../../services/configuration.service';
import { Router } from '@angular/router';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-searchhits-list',
  styleUrls: ['./searchhits-list.component.scss'],
  template: `
    <div *ngIf="searchHitsCodesAll && searchHitsCodesAll.length > 0">

      <div *ngIf="!showFullListOfCodes">
        <span class="badge badge-info">{{'theCodes' | translate}}:</span>
        <ul class="organizations dot-separated-list" *ngIf="searchHitsCodes5 && searchHitsCodes5.length > 0">
          <li class="organization" *ngFor="let sh of searchHitsCodes5">
            <a (click)="navigateToCode(sh.entityCodeValue, sh.codeSchemeCodeValue, sh.codeRegistryCodeValue)">{{getSearchHitLabelForScreen(sh)}}</a>
          </li>
          <div *ngIf="searchHitsCodesAll && searchHitsCodesAll.length > 5">
            <a (click)="onClickCodes($event)">...</a>
          </div>
        </ul>
      </div>

      <div *ngIf="showFullListOfCodes">
        <span class="badge badge-info">{{'theCodes' | translate}}:</span>
        <ul class="organizations dot-separated-list" *ngIf="searchHitsCodesAll && searchHitsCodesAll.length > 0">
          <li class="organization" *ngFor="let sh of searchHitsCodesAll">
            <a (click)="navigateToCode(sh.entityCodeValue, sh.codeSchemeCodeValue, sh.codeRegistryCodeValue)">{{getSearchHitLabelForScreen(sh)}}</a>
          </li>
          <div *ngIf="searchHitsCodesAll && searchHitsCodesAll.length > 5">
            <a (click)="onClickCodes($event)">...</a>
          </div>
        </ul>
      </div>

    </div>

    <div *ngIf="searchHitsExtensionsAll && searchHitsExtensionsAll.length > 0">

      <div *ngIf="!showFullListOfExtensions">
        <span class="badge badge-info">{{'theExtensions' | translate}}:</span>
        <ul class="organizations dot-separated-list" *ngIf="searchHitsExtensions5 && searchHitsExtensions5.length > 0">
          <li class="organization" *ngFor="let sh of searchHitsExtensions5">
            <a (click)="navigateToExtension(sh.entityCodeValue, sh.codeSchemeCodeValue, sh.codeRegistryCodeValue)">{{getSearchHitLabelForScreen(sh)}}</a>
          </li>
          <div *ngIf="searchHitsExtensionsAll && searchHitsExtensionsAll.length > 5">
            <a (click)="onClickExtensions($event)">...</a>
          </div>
        </ul>
      </div>

      <div *ngIf="showFullListOfExtensions">
        <span class="badge badge-info">{{'theExtensions' | translate}}:</span>
        <ul class="organizations dot-separated-list" *ngIf="searchHitsExtensionsAll && searchHitsExtensionsAll.length > 0">
          <li class="organization" *ngFor="let sh of searchHitsExtensionsAll">
            <a (click)="navigateToExtension(sh.entityCodeValue, sh.codeSchemeCodeValue, sh.codeRegistryCodeValue)">{{getSearchHitLabelForScreen(sh)}}</a>
          </li>
          <div *ngIf="searchHitsExtensionsAll && searchHitsExtensionsAll.length > 5">
            <a (click)="onClickExtensions($event)">...</a>
          </div>
        </ul>
      </div>

    </div>
  `
})
export class SearchHitsListComponent {
  showFullListOfCodes = false;
  showFullListOfExtensions = false;
  @Input() searchHitsCodes5: SearchHit[];
  @Input() searchHitsCodesAll: SearchHit[];
  @Input() searchHitsExtensions5: SearchHit[];
  @Input() searchHitsExtensionsAll: SearchHit[];
  /**
   * By setting captureClick to true the mouse click event expanding/collapsing the text will be stopped (stopPropagation and
   * preventDefault). This should enable use inside clickable greater containers. However, there may be side effects, so default is false.
   * Use only when needed.
   */
  @Input() captureClick = false;

  constructor(private configurationService: ConfigurationService,
              private router: Router,
              public languageService: LanguageService) {
  }

  onClickCodes($event: MouseEvent) {
    this.showFullListOfCodes = !this.showFullListOfCodes;
    if (this.captureClick) {
      $event.stopPropagation();
      $event.preventDefault();
    }
  }

  onClickExtensions($event: MouseEvent) {
    this.showFullListOfExtensions = !this.showFullListOfExtensions;
    if (this.captureClick) {
      $event.stopPropagation();
      $event.preventDefault();
    }
  }

  getUriWithEnv(uri: string): string | null {
    return this.configurationService.getUriWithEnv(uri);
  }

  getRouteToCode(entityCodeValue: string, codeSchemeCodeValue: string, codeRegistryCodeValue: string): any[] {
    return [
      'code',
      {
        registryCode: codeRegistryCodeValue,
        schemeCode: codeSchemeCodeValue,
        codeCode: entityCodeValue
      }
    ];
  }

  getRouteToExtension(entityCodeValue: string, codeSchemeCodeValue: string, codeRegistryCodeValue: string): any[] {
    return [
      'extension',
      {
        registryCode: codeRegistryCodeValue,
        schemeCode: codeSchemeCodeValue,
        extensionCode: entityCodeValue
      }
    ];
  }

  navigateToCode(entityCodeValue: string, codeSchemeCodeValue: string, codeRegistryCodeValue: string) {
    this.router.navigate(this.getRouteToCode(entityCodeValue, codeSchemeCodeValue, codeRegistryCodeValue));
  }

  navigateToExtension(entityCodeValue: string, codeSchemeCodeValue: string, codeRegistryCodeValue: string) {
    this.router.navigate(this.getRouteToExtension(entityCodeValue, codeSchemeCodeValue, codeRegistryCodeValue));
  }

  getSearchHitLabelForScreen(searchHit: SearchHit): string {
    return Object.keys(searchHit.prefLabel).length > 0 ? this.languageService.translate(searchHit.prefLabel, true) : searchHit.entityCodeValue;
  }
}
