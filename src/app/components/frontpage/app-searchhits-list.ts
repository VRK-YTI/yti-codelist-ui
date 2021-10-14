import { Component, Input } from '@angular/core';
import { SearchHit } from '../../entities/search-hit';
import { ConfigurationService } from '../../services/configuration.service';
import { Router } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { CodeScheme } from '../../entities/code-scheme';
import { Localizable } from '@vrk-yti/yti-common-ui';

@Component({
  selector: 'app-searchhits-list',
  styleUrls: ['./searchhits-list.component.scss'],
  template: `
      <div *ngIf="searchHitsCodesAll && searchHitsCodesAll.length > 0">
        <div class="deep-results-section-title" >{{'theCodes' | translate}}</div>
        <div class="deep-results-section-content" style="color:#2a6ebb;" *ngIf="searchHitsCodesAll && searchHitsCodesAll.length > 0">
            <a class="deep-results-hit" title="{{allLanguagesLabel(sh.prefLabel)}}" *ngFor="let sh of searchHitsCodesAll" (click)="navigateToCode(sh.entityCodeValue, sh.codeSchemeCodeValue, sh.codeRegistryCodeValue)"><span [innerHTML]="getSearchHitLabelForScreen(sh)"></span></a>
            <a  class="deep-results-show-all" *ngIf="totalNrOfSearchHitsCodes > 6" (click)="navigateToCodeSchemeFromCode(codeScheme.codeValue, codeScheme.codeRegistry.codeValue)">({{'See all results' | translate : {count: totalNrOfSearchHitsCodes} }})</a>
        </div>
      </div>

      <div *ngIf="searchHitsExtensionsAll && searchHitsExtensionsAll.length > 0">
        <div class="deep-results-section-title">{{'theExtensions' | translate}}</div>
        <div class="deep-results-section-content" style="color:#2a6ebb;" *ngIf="searchHitsExtensionsAll && searchHitsExtensionsAll.length > 0">
          <a class="deep-results-hit" title="{{allLanguagesLabel(sh.prefLabel)}}" *ngFor="let sh of searchHitsExtensionsAll" (click)="navigateToExtension(sh.entityCodeValue, sh.codeSchemeCodeValue, sh.codeRegistryCodeValue)"><span [innerHTML]="getSearchHitLabelForScreen(sh)"></span></a>
          <a  class="deep-results-show-all" *ngIf="totalNrOfSearchHitsExtensions > 6" (click)="navigateToCodeSchemeFromExtension(codeScheme.codeValue, codeScheme.codeRegistry.codeValue)">({{'See all results' | translate : {count: totalNrOfSearchHitsExtensions} }})</a>
        </div>

      </div>
  `
})
export class SearchHitsListComponent {

  @Input() searchHitsCodesAll: SearchHit[];
  @Input() searchHitsExtensionsAll: SearchHit[];
  @Input() totalNrOfSearchHitsCodes: number;
  @Input() totalNrOfSearchHitsExtensions: number;
  @Input() codeScheme: CodeScheme;
  @Input() searchTerm: string;

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

  getRouteToCodeScheme(codeSchemeCodeValue: string, codeRegistryCodeValue: string): any[] {
    return [
      'codescheme',
      {
        registryCode: codeRegistryCodeValue,
        schemeCode: codeSchemeCodeValue
      }
    ];
  }

  navigateToCode(entityCodeValue: string, codeSchemeCodeValue: string, codeRegistryCodeValue: string) {
    this.router.navigate(this.getRouteToCode(entityCodeValue.replace('<b>', '').replace('</b>', ''), codeSchemeCodeValue, codeRegistryCodeValue));
  }

  navigateToExtension(entityCodeValue: string, codeSchemeCodeValue: string, codeRegistryCodeValue: string) {
    this.router.navigate(this.getRouteToExtension(entityCodeValue.replace('<b>', '').replace('</b>', ''), codeSchemeCodeValue, codeRegistryCodeValue));
  }

  navigateToCodeSchemeFromCode(codeSchemeCodeValue: string, codeRegistryCodeValue: string) {
    this.router.navigate(this.getRouteToCodeScheme(codeSchemeCodeValue, codeRegistryCodeValue), { queryParams: { 'prefilledSearchTermForCode': this.searchTerm ? this.searchTerm : '' }});
  }

  navigateToCodeSchemeFromExtension(codeSchemeCodeValue: string, codeRegistryCodeValue: string) {
    this.router.navigate(this.getRouteToCodeScheme(codeSchemeCodeValue, codeRegistryCodeValue), { queryParams: { 'activeTab': 'codelist_extensions_tab' }} );
  }

  getSearchHitLabelForScreen(searchHit: SearchHit): string {
    return Object.keys(searchHit.prefLabel).length > 0 ? this.languageService.translate(searchHit.prefLabel, true) : searchHit.entityCodeValue;
  }

  allLanguagesLabel(label: Localizable): string | undefined {
    const exp = /<\/?b>/g;
    const keys = Object.keys(label);
    if (keys.length) {
      return keys.map(key => label[key].replace(exp, '') + ' (' + key + ')').join('\n');
    }
    return undefined;
  }
}
