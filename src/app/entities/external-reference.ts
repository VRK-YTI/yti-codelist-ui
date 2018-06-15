import { Localizable, Localizer } from 'yti-common-ui/types/localization';
import { PropertyType } from './property-type';
import { ExternalReferenceType } from '../services/api-schema';
import { requireDefined } from 'yti-common-ui/utils/object';
import { groupBy, index } from 'yti-common-ui/utils/array';
import { labelNameToResourceIdIdentifier } from 'yti-common-ui/utils/resource';

export const CCBy40LicenseLinkId = '9a25f7fc-e4be-11e7-82ab-479f4f288376';
export const CC0LicenseLinkId = '9553aad0-e4be-11e7-81e9-1faf2d228a02';

export class ExternalReference {

  id = '';
  url = '';
  href = '';
  title: Localizable = {};
  global = false;
  description: Localizable = {};
  propertyType?: PropertyType; // FIXME new link creation doesn't set this afaik

  constructor(data?: ExternalReferenceType) {
    if (data) {
      this.id = data.id;
      this.title = data.title || {};
      this.description = data.description || {};
      this.global = data.global;
      this.url = data.url;
      this.href = data.href;

      if (data.propertyType) {
        this.propertyType = new PropertyType(data.propertyType);
      }
    }
  }

  getDisplayName(localizer: Localizer): string {
    const title = localizer.translate(this.title);
    return title ? title : this.href;
  }

  getIdIdentifier(localizer: Localizer): string {
    const title = localizer.translate(this.title);
    return title ? `${labelNameToResourceIdIdentifier(title)}_${labelNameToResourceIdIdentifier(this.href)}`
                 : `${labelNameToResourceIdIdentifier(this.href)}`;
  }

  get image(): any {
    switch (this.id) {
      case CCBy40LicenseLinkId:
        return require('../../assets/images/ccby40-icon-88x31.png');
      case CC0LicenseLinkId:
        return require('../../assets/images/cc0-icon-88x31.png');
      default:
        return null;
    }
  }

  serialize(): ExternalReferenceType {
    return {
      id: this.id,
      url: this.url,
      href: this.href,
      title: {...this.title},
      global: this.global,
      description: {...this.description},
      propertyType: this.propertyType ? this.propertyType.serialize() : undefined
    };
  }

  clone() {
    return new ExternalReference(this.serialize());
  }
}

export interface PropertyTypeExternalReferences {
  label: Localizable;
  externalReferences: ExternalReference[];
}

export function groupByType(extReferences: ExternalReference[]): PropertyTypeExternalReferences[] {

  const propertyTypes = extReferences.map(er => requireDefined(er.propertyType));
  const propertyTypesByName = index(propertyTypes, pt => pt.localName);
  const mapNormalizedType = (pt: PropertyType) => requireDefined(propertyTypesByName.get(pt.localName));

  return Array.from(groupBy(extReferences, er => mapNormalizedType(requireDefined(er.propertyType))))
    .map(([propertyType, externalReferences]) => ({label: propertyType.prefLabel, externalReferences}));
}
