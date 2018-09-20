import { Localizable, Localizer } from 'yti-common-ui/types/localization';
import { formatDate, formatDateTime, formatDisplayDateTime, parseDate, parseDateTime } from '../utils/date';
import { Moment } from 'moment';
import { MemberSimpleType } from '../services/api-schema';
import { hasLocalization } from 'yti-common-ui/utils/localization';
import { TranslateService } from '@ngx-translate/core';
import { CodePlain } from './code-simple';

export class MemberSimple {

  id: string;
  url: string;
  memberValue_1: string;
  memberValue_2: string;
  memberValue_3: string;
  order?: string;
  modified: Moment | null = null;
  code: CodePlain;
  relatedMember?: MemberSimple;
  prefLabel: Localizable;
  startDate: Moment | null = null;
  endDate: Moment | null = null;
  expanded: boolean;

  constructor(data: MemberSimpleType) {
    this.id = data.id;
    this.url = data.url;
    this.order = data.order;
    this.memberValue_1 = data.memberValue_1;
    this.memberValue_2 = data.memberValue_2;
    this.memberValue_3 = data.memberValue_3;
    this.prefLabel = data.prefLabel || {};
    if (data.modified) {
      this.modified = parseDateTime(data.modified);
    }
    if (data.code) {
      this.code = new CodePlain(data.code);
    }
    if (data.relatedMember) {
      this.relatedMember = new MemberSimple(data.relatedMember);
    }
    if (data.startDate) {
      this.startDate = parseDate(data.startDate);
    }
    if (data.endDate) {
      this.endDate = parseDate(data.endDate);
    }
    this.expanded = false;
  }

  get modifiedDisplayValue(): string {
    return formatDisplayDateTime(this.modified);
  }

  serialize(): MemberSimpleType {
    return {
      id: this.id,
      url: this.url,
      memberValue_1: this.memberValue_1,
      memberValue_2: this.memberValue_2,
      memberValue_3: this.memberValue_3,
      prefLabel: { ...this.prefLabel },
      modified: formatDateTime(this.modified),
      order: this.order,
      code: this.code.serialize(),
      relatedMember: this.relatedMember ? this.relatedMember.serialize() : undefined,
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

  clone(): MemberSimple {
    return new MemberSimple(this.serialize());
  }
}
