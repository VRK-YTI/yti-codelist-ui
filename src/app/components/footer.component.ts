import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  styleUrls: ['./footer.component.scss'],
  template: `
    <div class="panel-footer">
    <div class="col-xs-12">
    <svg  id="beta_suomifi_logo" width="60" height="60">
    <g>
      <path fill="#003479" d="M53,0H2C0.9,0,0,0.9,0,2v51c0,1.1,0.9,2,2,2h51c1.1,0,2-0.9,2-2V2C55,0.9,54.1,0,53,0z"></path>
      <g>
        <path fill="#FFFFFF" d="M14,20v-5c0-1.1,0.9-2,2-2h5v7"></path>
        <path fill="#FFFFFF" d="M14,27h7v14c0,0.5-0.4,1-1,1h-5c-0.6,0-1-0.5-1-1"></path>
        <path fill="#FFFFFF" d="M28,13h13c0.5,0,1,0.4,1,1v6H28"></path>
        <path fill="#FFFFFF" d="M41,34H28v-7h14v6C42,33.6,41.6,34,41,34z"></path>
      </g>
    </g>
  </svg>
  <span class="strong">Koodistoeditori</span>
  </div>
    <span class="text">
        Verkkopalvelun kehittämisestä vastaa <br/>
        Väestörekisterikeskus
      </span>
      <span class="pull-right">
      <a href="/">Tietoa verkkopalvelusta</a>
      <a href="/">Tietosuojaseloste</a>
      <a href="/">Käytön tuki ja ohjeet</a>
      <br/>
      <a href="/">Lisenssi</a>
      <a href="/">Ota yhteyttä</a>      
      </span>
    </div>
  `
})
export class FooterComponent {

}
