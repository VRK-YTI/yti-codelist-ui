import { Component, Input, OnInit } from '@angular/core';
import { LanguageService } from '../../services/language.service';
import { MessagingResource } from '../../entities-messaging/messaging-resource';
import { CodeListConfirmationModalService } from '../common/confirmation-modal.service';
import { CodeListErrorModalService } from '../common/error-modal.service';
import { ConfigurationService } from '../../services/configuration.service';
import { BehaviorSubject } from 'rxjs';
import { MessagingService } from '../../services/messaging-service';
import { NgbNav } from '@ng-bootstrap/ng-bootstrap';
import { comparingLocalizable, comparingPrimitive, ignoreModalClose, UserService } from '@vrk-yti/yti-common-ui';

@Component({
  selector: 'app-user-details-subscriptions',
  styleUrls: ['./user-details-subscriptions.component.scss'],
  templateUrl: './user-details-subscriptions.component.html',
})
export class UserDetailsSubscriptionsComponent implements OnInit {

  @Input() nav: NgbNav;

  messagingResources$ = new BehaviorSubject<Map<string, MessagingResource[]> | null>(null);

  subscriptionType: string;

  loading = true;

  APPLICATION_CODELIST = 'codelist';
  APPLICATION_TERMINOLOGY = 'terminology';
  APPLICATION_DATAMODEL = 'datamodel';
  APPLICATION_COMMENTS = 'comments';

  constructor(public languageService: LanguageService,
              private messagingService: MessagingService,
              private configurationService: ConfigurationService,
              private userService: UserService,
              private confirmationModalService: CodeListConfirmationModalService,
              private errorModalService: CodeListErrorModalService) {

    this.languageService.language$.subscribe(language => {
      this.sortMessagingResources();
    });
  }

  ngOnInit() {

    if (this.configurationService.isMessagingEnabled && this.userService.isLoggedIn()) {
      this.getUserSubscriptionData();
    } else {
      this.loading = false;
    }
  }

  getUserSubscriptionData() {

    this.loading = true;

    this.messagingService.getMessagingUserData().subscribe(messagingUserData => {
      if (messagingUserData) {
        this.subscriptionType = messagingUserData.subscriptionType;
        const resources = new Map<string, MessagingResource[]>();
        const codelistMessagingResources: MessagingResource[] = [];
        const datamodelMessagingResources: MessagingResource[] = [];
        const terminologyMessagingResources: MessagingResource[] = [];
        const commentsMessagingResources: MessagingResource[] = [];

        messagingUserData.resources.forEach(resource => {
          if (resource.application === this.APPLICATION_CODELIST) {
            codelistMessagingResources.push(resource);
          } else if (resource.application === this.APPLICATION_DATAMODEL) {
            datamodelMessagingResources.push(resource);
          } else if (resource.application === this.APPLICATION_TERMINOLOGY) {
            terminologyMessagingResources.push(resource);
          } else if (resource.application === this.APPLICATION_COMMENTS) {
            commentsMessagingResources.push(resource);
          }
        });
        if (codelistMessagingResources.length > 0) {
          resources.set(this.APPLICATION_CODELIST, codelistMessagingResources);
        }
        if (datamodelMessagingResources.length > 0) {
          resources.set(this.APPLICATION_DATAMODEL, datamodelMessagingResources);
        }
        if (terminologyMessagingResources.length > 0) {
          resources.set(this.APPLICATION_TERMINOLOGY, terminologyMessagingResources);
        }
        if (commentsMessagingResources.length > 0) {
          resources.set(this.APPLICATION_COMMENTS, commentsMessagingResources);
        }
        if (resources.size > 0) {
          this.messagingResources = resources;
          this.sortMessagingResources();
        } else {
          this.messagingResources = null;
        }
      } else {
        this.messagingResources = null;
      }
      this.loading = false;
    });
  }

  sortMessagingResources() {

    const resourceMap: Map<string, MessagingResource[]> | null = this.messagingResources$.getValue();
    if (resourceMap) {
      this.sortApplicationResources(resourceMap, this.APPLICATION_TERMINOLOGY);
      this.sortApplicationResources(resourceMap, this.APPLICATION_DATAMODEL);
      this.sortApplicationResources(resourceMap, this.APPLICATION_CODELIST);
      this.sortApplicationResources(resourceMap, this.APPLICATION_COMMENTS);
    }
    this.messagingResources = resourceMap;
  }

  sortApplicationResources(resourceMap: Map<string, MessagingResource[]>,
                           applicationIdentifier: string) {
    if (resourceMap.has(applicationIdentifier)) {
      // @ts-ignore
      resourceMap.get(applicationIdentifier).sort(comparingPrimitive<MessagingResource>(
        resource => this.languageService.isLocalizableEmpty(resource.prefLabel))
        .andThen(comparingPrimitive<MessagingResource>(resource =>
          this.languageService.isLocalizableEmpty(resource.prefLabel) ? resource.uri.toLowerCase() : null))
        .andThen(comparingLocalizable<MessagingResource>(this.languageService,
          resource => resource.prefLabel ? resource.prefLabel : {}, true)));
    }
  }

  get messagingResources(): Map<string, MessagingResource[]> | null {

    return this.messagingResources$.getValue();
  }

  set messagingResources(value: Map<string, MessagingResource[]> | null) {

    this.messagingResources$.next(value);
  }

  removeSubscription(resource: MessagingResource) {

    this.confirmationModalService.openRemoveSubscription()
      .then(() => {
        this.messagingService.deleteSubscription(resource.uri).subscribe(success => {
          if (success) {
            const messagingResources = this.messagingResources;
            if (messagingResources != null) {
              const resources = messagingResources.get(resource.application);
              if (resources != null) {
                const resourceIndex = resources.indexOf(resource, 0);
                if (resourceIndex > -1) {
                  resources.splice(resourceIndex, 1);
                }
                if (resources.length === 0) {
                  messagingResources.delete(resource.application);
                  this.messagingResources = messagingResources;
                }
                if (messagingResources.size === 0) {
                  this.nav.select('user_details_info_tab');
                }
              }
            }
          } else {
            this.errorModalService.open('Submit error', 'Subscription deletion failed.', null);
          }
        });
      }, ignoreModalClose);
  }

  get isSubscriptionEnabled(): boolean {

    return this.subscriptionType !== 'DISABLED';
  }

  toggleSubscription(event: Event) {

    event.preventDefault();
    const subscriptionTargetType = this.subscriptionType === 'DAILY' ? 'DISABLED' : 'DAILY';

    this.confirmationModalService.openToggleNotifications(subscriptionTargetType === 'DAILY')
      .then(() => {
        this.messagingService.setSubscriptionType(subscriptionTargetType).subscribe(messagingUserData => {
          console.log('change subscription type to: ' + messagingUserData.subscriptionType);
          this.subscriptionType = messagingUserData.subscriptionType;
        });
      }, ignoreModalClose);
  }

  getUriWithEnv(uri: string): string | null {

    return this.configurationService.getUriWithEnv(uri);
  }
}
