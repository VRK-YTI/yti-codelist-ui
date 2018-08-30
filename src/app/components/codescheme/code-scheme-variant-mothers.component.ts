import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CodeScheme} from '../../entities/code-scheme';
import {ignoreModalClose} from 'yti-common-ui/utils/modal';
import {DataService} from '../../services/data.service';
import {CodeSchemeListItem} from '../../entities/code-scheme-list-item';
import {CodeRegistry} from '../../entities/code-registry';
import { CodeListConfirmationModalService } from '../common/confirmation-modal.service';
import {AuthorizationManager} from '../../services/authorization-manager.service';

@Component({
  selector: 'app-code-scheme-variant-mothers',
  templateUrl: './code-scheme-variant-mothers.component.html',
  styleUrls: ['./code-scheme-variant-mothers.component.scss']
})
export class CodeSchemeVariantMothersComponent {

  @Input() codeScheme: CodeScheme;
}
