import { Localizable, Localizer } from 'yti-common-ui/types/localization';
import { Location } from 'yti-common-ui/types/location';
import { formatDate, formatDateTime, formatDisplayDateTime, parseDate, parseDateTime } from '../utils/date';
import { EditableEntity } from './editable-entity';
import { Moment } from 'moment';
import { MemberType } from '../services/api-schema';
import { hasLocalization } from 'yti-common-ui/utils/localization';
import { Extension } from './extension';
import { MemberSimple } from './member-simple';
import { TranslateService } from '@ngx-translate/core';
import { Code } from './code';

export class Member implements EditableEntity {

  id: string;
  url: string;
  memberValue_1: string;
  memberValue_2: string;
  memberValue_3: string;
  order?: string;
  modified: Moment | null = null;
  extension: Extension;
  relatedMember?: MemberSimple;
  code: Code;
  prefLabel: Localizable;
  startDate: Moment | null = null;
  endDate: Moment | null = null;

  constructor(data: MemberType) {
    this.id = data.id;
    this.url = data.url;
    this.order = data.order;
    this.memberValue_1 = data.memberValue_1;
    this.memberValue_2 = data.memberValue_2;
    this.memberValue_3 = data.memberValue_3;
    if (data.modified) {
      this.modified = parseDateTime(data.modified);
    }
    this.prefLabel = data.prefLabel || {};
    this.extension = new Extension(data.extension);
    if (data.relatedMember) {
      this.relatedMember = new MemberSimple(data.relatedMember);
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
        registryCode: this.extension.parentCodeScheme.codeRegistry.codeValue,
        schemeCode: this.extension.parentCodeScheme.codeValue,
        extensionCode: this.extension.codeValue,
        memberId: this.id
      }
    ];
  }

  get location(): Location[] {
    return [
      ...this.extension.location,
      {
        localizationKey: 'Member',
        label: this.prefLabel,
        value: !hasLocalization(this.prefLabel) ? this.code.codeValue : '',
        route: this.route
      }];
  }

  getOwningOrganizationIds(): string[] {
    return this.extension.parentCodeScheme.organizations.map(org => org.id);
  }

  allowOrganizationEdit(): boolean {
    return true;
  }

  serialize(): MemberType {
    return {
      id: this.id,
      url: this.url,
      prefLabel: { ...this.prefLabel },
      memberValue_1: this.memberValue_1,
      memberValue_2: this.memberValue_2,
      memberValue_3: this.memberValue_3,
      modified: formatDateTime(this.modified),
      order: this.order,
      extension: this.extension.serialize(),
      relatedMember: this.relatedMember ? this.relatedMember.serialize() : undefined,
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
    if (this.code.codeScheme.id !== this.extension.parentCodeScheme.id) {
      const codeSchemeTitle = localizer.translate(this.code.codeScheme.prefLabel, useUILanguage);
      codeTitle = codeTitle + ' - ' + codeSchemeTitle;
    }

    const memberValue_1 = this.memberValue_1;
    const memberValue_2 = this.memberValue_2;

    let displayName = '';

    if (memberValue_1) {
      displayName = `${memberValue_1}`;
    }

    if (extensionTitle) {
      displayName = `${displayName} ${extensionTitle}`
    }

    if (codeTitle) {
      if (extensionTitle) {
        displayName = `${displayName} · ${codeTitle}`
      } else {
        displayName = `${displayName} ${codeTitle}`
      }
    }

    if (memberValue_2) {
      displayName = `${displayName} ${memberValue_2}`;
    }

    return displayName;
  }

  getDisplayNameWithExtension(extension: Extension,
                              localizer: Localizer,
                              translater: TranslateService,
                              useUILanguage: boolean = false): string {
    const extensionTitle = localizer.translate(this.prefLabel, useUILanguage);

    let codeTitle = this.code ? localizer.translate(this.code.prefLabel, useUILanguage) : null;
    if (!codeTitle) {
      codeTitle = this.code ? this.code.codeValue : null;
    }
    if (this.code.codeScheme.id !== extension.parentCodeScheme.id) {
      const codeSchemeTitle = localizer.translate(this.code.codeScheme.prefLabel, useUILanguage);
      codeTitle = codeTitle + ' - ' + codeSchemeTitle;
    }

    const memberValue_1 = this.memberValue_1;
    const memberValue_2 = this.memberValue_2;

    let displayName = '';

    if (memberValue_1) {
      displayName = `${memberValue_1}`;
    }

    if (extensionTitle) {
      displayName = `${displayName} ${extensionTitle}`
    }

    if (codeTitle) {
      if (extensionTitle) {
        displayName = `${displayName} · ${codeTitle}`
      } else {
        displayName = `${displayName} ${codeTitle}`
      }
    }

    if (memberValue_2) {
      displayName = `${displayName} ${memberValue_2}`;
    }

    return displayName;
  }

  hasPrefLabel() {
    return hasLocalization(this.code.prefLabel);
  }

  clone(): Member {
    return new Member(this.serialize());
  }
}
