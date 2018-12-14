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
import { MemberValue } from './member-value';
import { ValueType } from './value-type';

export class Member implements EditableEntity {

  id: string;
  url: string;
  uri: string;
  order?: string;
  created: Moment | null = null;
  modified: Moment | null = null;
  extension: Extension;
  relatedMember?: MemberSimple;
  code: Code;
  prefLabel: Localizable;
  startDate: Moment | null = null;
  endDate: Moment | null = null;
  memberValues: MemberValue[] = [];

  constructor(data: MemberType) {
    this.id = data.id;
    this.url = data.url;
    this.uri = data.uri;
    this.order = data.order;
    this.memberValues = (data.memberValues || []).map(mv => new MemberValue(mv));
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
      uri: this.uri,
      url: this.url,
      prefLabel: { ...this.prefLabel },
      created: formatDateTime(this.modified),
      modified: formatDateTime(this.modified),
      order: this.order,
      extension: this.extension.serialize(),
      relatedMember: this.relatedMember ? this.relatedMember.serialize() : undefined,
      code: this.code.serialize(),
      startDate: formatDate(this.startDate),
      endDate: formatDate(this.endDate),
      memberValues: this.memberValues.map(mv => mv.serialize())
    };
  }

  getMemberValueForLocalNameIfEnabled(extension: Extension,
                                      localName: string) {
    let memberValueValue: string | undefined;
    const valueType: ValueType | null = (extension.propertyType.valueTypeForLocalName(localName));
    if (valueType && this.memberValues) {
      this.memberValues.forEach(memberValue => {
        if (memberValue.valueType.localName === localName) {
          memberValueValue = memberValue.value;
        }
      });
    } else {
      memberValueValue = undefined;
    }
    return memberValueValue;
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

    let displayName = '';

    const unaryOperator = this.getMemberValueForLocalNameIfEnabled(this.extension, 'unaryOperator');

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

    const comparisonOperator = this.getMemberValueForLocalNameIfEnabled(this.extension, 'comparisonOperator');

    if (comparisonOperator) {
      displayName = `${displayName} ${comparisonOperator}`;
    }

    return displayName;
  }

  getDisplayNameWithCodeValue(localizer: Localizer, translater: TranslateService, useUILanguage: boolean = false): string {
    let codeTitle = this.code ? localizer.translate(this.code.prefLabel, useUILanguage) : null;
    if (!codeTitle) {
      codeTitle = this.code ? this.code.codeValue : null;
    }
    const displayName = this.code.codeValue + ' - ' + codeTitle;
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

    let displayName = '';

    const unaryOperator = this.getMemberValueForLocalNameIfEnabled(extension, 'unaryOperator');

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

    const comparisonOperator = this.getMemberValueForLocalNameIfEnabled(extension, 'comparisonOperator');

    if (comparisonOperator) {
      displayName = `${displayName} ${comparisonOperator}`;
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
