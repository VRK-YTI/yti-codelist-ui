import { Localizable, Localizer } from 'yti-common-ui/types/localization';
import { Location } from 'yti-common-ui/types/location';
import { formatDate, formatDateTime, formatDisplayDateTime, parseDate, parseDateTime } from '../utils/date';
import { EditableEntity } from './editable-entity';
import { Moment } from 'moment';
import { MemberType } from '../services/api-schema';
import { hasLocalization } from 'yti-common-ui/utils/localization';
import { ExtensionScheme } from './extension-scheme';
import { MemberSimple } from './member-simple';
import { TranslateService } from '@ngx-translate/core';
import { Code } from './code';

export class Member implements EditableEntity {

  id: string;
  url: string;
  memberValue: string;
  order?: string;
  modified: Moment | null = null;
  extensionScheme: ExtensionScheme;
  broaderMember?: MemberSimple;
  code: Code;
  prefLabel: Localizable;
  startDate: Moment | null = null;
  endDate: Moment | null = null;

  constructor(data: MemberType) {
    this.id = data.id;
    this.url = data.url;
    this.order = data.order;
    this.memberValue = data.memberValue;
    if (data.modified) {
      this.modified = parseDateTime(data.modified);
    }
    this.prefLabel = data.prefLabel || {};
    this.extensionScheme = new ExtensionScheme(data.extensionScheme);
    if (data.broaderMember) {
      this.broaderMember = new MemberSimple(data.broaderMember);
    }
    if (data.code) {
      this.code = new Code(data.code);
    }
    if (data.startDate) {
      this.startDate = parseDate(data.startDate);
    }
    if (data.endDate) {
      this.endDate = parseDate(data.endDate);
    }
  }

  get modifiedDisplayValue(): string {
    return formatDisplayDateTime(this.modified);
  }

  get route(): any[] {
    return [
      'member',
      {
        registryCode: this.extensionScheme.parentCodeScheme.codeRegistry.codeValue,
        schemeCode: this.extensionScheme.parentCodeScheme.codeValue,
        extensionSchemeCode: this.extensionScheme.codeValue,
        memberId: this.id
      }
    ];
  }

  get location(): Location[] {
    return [
      ...this.extensionScheme.location,
      {
        localizationKey: 'Member',
        label: this.prefLabel,
        value: !hasLocalization(this.prefLabel) ? this.code.codeValue : '',
        route: this.route
      }];
  }

  getOwningOrganizationIds(): string[] {
    return this.extensionScheme.parentCodeScheme.organizations.map(org => org.id);
  }

  allowOrganizationEdit(): boolean {
    return true;
  }

  serialize(): MemberType {
    return {
      id: this.id,
      url: this.url,
      prefLabel: { ...this.prefLabel },
      memberValue: this.memberValue,
      modified: formatDateTime(this.modified),
      order: this.order,
      extensionScheme: this.extensionScheme.serialize(),
      broaderMember: this.broaderMember ? this.broaderMember.serialize() : undefined,
      code: this.code.serialize(),
      startDate: formatDate(this.startDate),
      endDate: formatDate(this.endDate)
    };
  }

  getDisplayName(localizer: Localizer, translater: TranslateService, useUILanguage: boolean = false): string {
    const extensionTitle = localizer.translate(this.prefLabel, useUILanguage);

    let codeTitle = this.code ? localizer.translate(this.code.prefLabel, useUILanguage) : null;
    if (!codeTitle) {
      codeTitle = this.code ? this.code.codeValue : null;
    }
    if (this.code.codeScheme.id !== this.extensionScheme.parentCodeScheme.id) {
      const codeSchemeTitle = localizer.translate(this.code.codeScheme.prefLabel, useUILanguage);
      codeTitle = codeTitle + ' - ' + codeSchemeTitle;
    }

    const memberValue = this.memberValue;

    if (extensionTitle && memberValue) {
      return `${memberValue} ${extensionTitle} - ${codeTitle}`;
    } else if (memberValue) {
      return `${memberValue} - ${codeTitle}`;
    } else if (extensionTitle) {
      return `${extensionTitle} - ${codeTitle}`;
    } else {
      return codeTitle ? codeTitle : '';
    }
  }

  getDisplayNameWithExtensionScheme(extensionScheme: ExtensionScheme,
                                    localizer: Localizer,
                                    translater: TranslateService,
                                    useUILanguage: boolean = false): string {
    const extensionTitle = localizer.translate(this.prefLabel, useUILanguage);

    let codeTitle = this.code ? localizer.translate(this.code.prefLabel, useUILanguage) : null;
    if (!codeTitle) {
      codeTitle = this.code ? this.code.codeValue : null;
    }
    if (this.code.codeScheme.id !== extensionScheme.parentCodeScheme.id) {
      const codeSchemeTitle = localizer.translate(this.code.codeScheme.prefLabel, useUILanguage);
      codeTitle = codeTitle + ' - ' + codeSchemeTitle;
    }

    const memberValue = this.memberValue;

    if (extensionTitle && memberValue) {
      return `${memberValue} ${extensionTitle} - ${codeTitle}`;
    } else if (memberValue) {
      return `${memberValue} - ${codeTitle}`;
    } else if (extensionTitle) {
      return `${extensionTitle} - ${codeTitle}`;
    } else {
      return codeTitle ? codeTitle : '';
    }
  }

  hasPrefLabel() {
    return hasLocalization(this.code.prefLabel);
  }

  clone(): Member {
    return new Member(this.serialize());
  }
}