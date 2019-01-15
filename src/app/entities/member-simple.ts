import { Localizable, Localizer } from 'yti-common-ui/types/localization';
import { formatDate, formatDateTime, formatDisplayDateTime, parseDate, parseDateTime } from '../utils/date';
import { Moment } from 'moment';
import { MemberSimpleType } from '../services/api-schema';
import { hasLocalization } from 'yti-common-ui/utils/localization';
import { TranslateService } from '@ngx-translate/core';
import { MemberValue } from './member-value';
import { CodePlainWithCodeScheme } from './code-simple-with-codescheme';

export class MemberSimple {

  id: string;
  uri: string;
  url: string;
  order?: string;
  modified: Moment | null = null;
  code: CodePlainWithCodeScheme;
  relatedMember?: MemberSimple;
  prefLabel: Localizable;
  startDate: Moment | null = null;
  endDate: Moment | null = null;
  expanded: boolean;
  memberValues: MemberValue[];

  constructor(data: MemberSimpleType) {
    this.id = data.id;
    this.uri = data.uri;
    this.url = data.url;
    this.order = data.order;
    this.prefLabel = data.prefLabel || {};
    this.memberValues = (data.memberValues || []).map(mv => new MemberValue(mv));
    if (data.modified) {
      this.modified = parseDateTime(data.modified);
    }
    if (data.code) {
      this.code = new CodePlainWithCodeScheme(data.code);
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
      uri: this.uri,
      url: this.url,
      prefLabel: { ...this.prefLabel },
      modified: formatDateTime(this.modified),
      order: this.order,
      code: this.code ? this.code.serialize() : undefined,
      relatedMember: this.relatedMember ? this.relatedMember.serialize() : undefined,
      startDate: formatDate(this.startDate),
      endDate: formatDate(this.endDate),
      memberValues: this.memberValues.map(mv => mv.serialize())
    };
  }

  getMemberValueForLocalName(localName: string): string | null {
    let memberValueValue = null;
    this.memberValues.forEach(memberValue => {
      if (memberValue.valueType.localName === localName) {
        memberValueValue = memberValue.value;
      }
    });
    return memberValueValue;
  }

  getDisplayNameWithCodeValue(localizer: Localizer, translater: TranslateService, useUILanguage: boolean = false): string {
    let codeTitle = this.code ? localizer.translate(this.code.prefLabel, useUILanguage) : null;
    if (!codeTitle) {
      codeTitle = this.code ? this.code.codeValue : null;
    }
    const displayName = this.code.codeValue + ' - ' + codeTitle;
    return displayName;
  }

  getDisplayName(localizer: Localizer, translater: TranslateService, useUILanguage: boolean = false): string {
    const memberTitle = localizer.translate(this.prefLabel, useUILanguage);
    let codeTitle = this.code ? localizer.translate(this.code.prefLabel, useUILanguage) : null;
    if (!codeTitle) {
      codeTitle = this.code ? this.code.codeValue : null;
    }

    let codeSchemeTitle = this.code.codeScheme ? localizer.translate(this.code.codeScheme.prefLabel, useUILanguage) : null;
    if (!codeSchemeTitle) {
      codeSchemeTitle = this.code.codeScheme ? ( this.code.codeScheme.codeValue ? this.code.codeScheme.codeValue : null ) : null;
    }

    let codeRegistryTitle = this.code.codeScheme ? ( this.code.codeScheme.codeRegistry ? localizer.translate(this.code.codeScheme.codeRegistry.prefLabel, useUILanguage) : null ) : null;
    if (!codeRegistryTitle) {
      codeRegistryTitle = this.code.codeScheme ? ( this.code.codeScheme.codeRegistry.codeValue ? this.code.codeScheme.codeRegistry.codeValue : null ) : null;
    }

    const unaryOperator = this.getMemberValueForLocalName('unaryOperator');
    const comparisonOperator = this.getMemberValueForLocalName('comparisonOperator');

    let displayName = '';

    if (unaryOperator) {
      displayName = `${unaryOperator}`;
    }

    if (memberTitle) {
      displayName = `${displayName} ${memberTitle}`
    }

    if (codeTitle) {
      if (memberTitle) {
        displayName = `${displayName} · ${codeTitle}`
      } else {
        displayName = `${displayName} ${codeTitle}`
      }
    }

    if (codeSchemeTitle) {
      if (codeTitle) {
        displayName = `${displayName} · ${codeSchemeTitle}`
      } else {
        displayName = `${displayName} ${codeSchemeTitle}`
      }
    }

    if (codeRegistryTitle) {
      if (codeSchemeTitle) {
        displayName = `${displayName} · ${codeRegistryTitle}`
      } else {
        displayName = `${displayName} ${codeRegistryTitle}`
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
