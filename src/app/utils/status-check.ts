import { allowedTargetStatuses, contains, restrictedStatuses, Status } from '@vrk-yti/yti-common-ui';
import { Code } from '../entities/code';
import { CodeScheme } from '../entities/code-scheme';
import { Extension } from '../entities/extension';

export type ResourceWithStatus = Code | CodeScheme | Extension;

export function changeToRestrictedStatus(resource: ResourceWithStatus, newStatus: Status): Boolean {
  return !resource.restricted && contains(restrictedStatuses, newStatus);
}

export function isCodeSchemeStatusGettingChangedValidlySoThatWeNeedToAskDoCodesStatusesUpdatedToo(oldStatus: Status, newStatus: Status): Boolean {

  let result: Boolean = false;
  const fromStatuses = ['INCOMPLETE', 'DRAFT', 'VALID', 'RETIRED', 'INVALID'] as Status[];
  const toStatuses = ['INCOMPLETE', 'DRAFT', 'VALID', 'RETIRED', 'INVALID'] as Status[];

  if (fromStatuses.includes(oldStatus)) {

    if (allowedTargetStatuses(oldStatus, false).includes(newStatus)) {
      result = true;
    }
  }
  return result;
}


