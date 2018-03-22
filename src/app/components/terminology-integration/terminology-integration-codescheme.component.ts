import {Component, Injectable} from '@angular/core';
import {EditableService} from '../../services/editable.service';
import {Router} from '@angular/router';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {DataService} from '../../services/data.service';
import {Vocabulary} from '../../entities/Vocabulary';
import { LanguageService } from '../../services/language.service';
import {ModalService} from '../../services/modal.service';
import { OnInit } from '@angular/core';
import {FilterOptions} from 'yti-common-ui/components/filter-dropdown.component';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {TranslateService} from 'ng2-translate';

@Injectable()
export class TerminologyIntegrationModalService {

  constructor(private modalService: ModalService) {
  }

  public open(): void {
    this.modalService.open(TerminologyIntegrationCodeSchemeComponent, {size: 'sm'});
  }
}


@Component({
  selector: 'app-terminology-integration-codescheme-modal',
  templateUrl: './terminology-integration-codescheme-modal.component.html',
  providers: [EditableService]
})
export class TerminologyIntegrationCodeSchemeComponent implements OnInit {

  vocabularies: Array<Vocabulary> | null = null;
  process = false;
  vocabulariesLoaded = false;
  vocabularyOptions: FilterOptions<Vocabulary>;
  vocabulary$ = new BehaviorSubject<Vocabulary|null>(null);

  constructor(private editableService: EditableService,
              private dataService: DataService,
              private router: Router,
              private modal: NgbActiveModal,
              private languageService: LanguageService,
              private translateService: TranslateService) {
  }

  ngOnInit() {
    this.dataService.getVocabularies().subscribe(vocabularies => {
      console.log('raw vocabs');
      console.log(vocabularies);

      this.vocabularyOptions = [null, ...vocabularies].map(voc => ({
        value: voc,
        name: () => voc ? this.languageService.translate(voc.prefLabel, true)
                        : this.translateService.instant('All vocabularies')
      }));
      this.vocabularies = vocabularies;

    });
  }
  get processing(): boolean {
    return !this.vocabulariesLoaded || this.process;
  }

  close() {
    this.modal.dismiss('cancel');
  }

  canSave() {
    return this.vocabularies != null;
  }
}
