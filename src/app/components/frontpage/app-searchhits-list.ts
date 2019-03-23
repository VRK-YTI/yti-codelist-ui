import { Component, Input } from '@angular/core';
import { SearchHit } from '../../entities/search-hit';
import { ConfigurationService } from '../../services/configuration.service';

@Component({
  selector: 'app-searchhits-list',
  styleUrls: ['./searchhits-list.component.scss'],
  template: `
    <div *ngIf="searchHitsCodesAll && searchHitsCodesAll.length > 0">

      <div *ngIf="!showFullListOfCodes">
        <span class="badge badge-info">{{'theCodes' | translate}}:</span>
        <ul class="organizations dot-separated-list" *ngIf="searchHitsCodes5 && searchHitsCodes5.length > 0">
          <li class="organization" *ngFor="let sh of searchHitsCodes5">
            <a href="#">{{sh.prefLabel | translateValue}}</a>
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
            <a href="#">{{sh.prefLabel | translateValue}}</a>
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
            <a href="#">{{sh.prefLabel | translateValue}}</a>
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
            <a href="#">{{sh.prefLabel | translateValue}}</a>
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
  @Input() captureClick: boolean = false;

  constructor(private configurationService: ConfigurationService) {
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
}
