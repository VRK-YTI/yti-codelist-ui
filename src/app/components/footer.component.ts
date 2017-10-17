import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  styleUrls: ['./footer.component.scss'],
  template: `
  <div class="container pt-5 pl-3 px-2">
    <div class="row px-3">      
        <svg viewBox="0 0 50 100" id="beta_suomifi_logo" width="80" height="80">
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
        <h4><a href="/">Koodistoeditori</a></h4>    
    </div>
    <div class="row px-3">
      <div class="col">
           Verkkopalvelun kehittämisestä vastaa <br/>
           Väestörekisterikeskus
      </div>
      <div class="col pull-right">
         <a href="/">Tietoa verkkopalvelusta</a>
         <a href="/">Tietosuojaseloste</a>
         <a href="/">Käytön tuki ja ohjeet</a>
         <br/>
         <a href="/">Lisenssi</a>
         <a href="/">Ota yhteyttä</a>      
       </div>
    </div>
  </div>
  `
})
export class FooterComponent {

}
