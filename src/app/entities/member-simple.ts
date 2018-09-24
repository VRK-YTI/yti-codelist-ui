import { Localizable, Localizer } from 'yti-common-ui/types/localization';
import { formatDate, formatDateTime, formatDisplayDateTime, parseDate, parseDateTime } from '../utils/date';
import { Moment } from 'moment';
import { MemberSimpleType } from '../services/api-schema';
import { hasLocalization } from 'yti-common-ui/utils/localization';
import { TranslateService } from '@ngx-translate/core';
import { CodePlain } from './code-simple';
import { MemberValue } from './member-value';

export class MemberSimple {

  id: string;
  url: string;
  order?: string;
  modified: Moment | null = null;
  code: CodePlain;
  relatedMember?: MemberSimple;
  prefLabel: Localizable;
  startDate: Moment | null = null;
  endDate: Moment | null = null;
  expanded: boolean;
  memberValues: MemberValue[];

  constructor(data: MemberSimpleType) {
    this.id = data.id;
    this.url = data.url;
    this.order = data.order;
    this.prefLabel = data.prefLabel || {};
    this.memberValues = (data.memberValues || []).map(mv => new MemberValue(mv));
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
      prefLabel: { ...this.prefLabel },
      modified: formatDateTime(this.modified),
      order: this.order,
      code: this.code.serialize(),
      relatedMember: this.relatedMember ? this.relatedMember.serialize() : undefined,
      startDate: formatDate(this.startDate),
      endDate: formatDate(this.endDate),
      memberValues: this.memberValues.map(mv => mv.serialize())
    };
  }

  getMemberValueForLocalName(localName: string) {
    let memberValueValue;
    this.memberValues.forEach(memberValue => {
      if (memberValue.valueType.localName === localName) {
        memberValueValue = memberValue.value;
      }
    });
    return memberValueValue;
  }

  getDisplayName(localizer: Localizer, translater: TranslateService, useUILanguage: boolean = false): string {
    const extensionTitle = localizer.translate(this.prefLabel, useUILanguage);

    let codeTitle = this.code ? localizer.translate(this.code.prefLabel, useUILanguage) : null;
    if (!codeTitle) {
      codeTitle = this.code ? this.code.codeValue : null;
    }

    const unaryOperator = this.getMemberValueForLocalName('unaryOperator');
    const comparisonOperator = this.getMemberValueForLocalName('comparisonOperator');

    let displayName = '';

    if (unaryOperator) {
      displayName = `${unaryOperator}`;
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

    if (comparisonOperator) {
      displayName = `${displayName} ${comparisonOperator}`;
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
