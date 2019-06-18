import { Code } from '../entities/code';
import { CodeScheme } from '../entities/code-scheme';
import { Extension } from '../entities/extension';
import { restrictedStatuses, Status } from 'yti-common-ui/entities/status';
import { contains } from 'yti-common-ui/utils/array';

export type ResourceWithStatus = Code | CodeScheme | Extension;

export function changeToRestrictedStatus(resource: ResourceWithStatus, newStatus: Status): Boolean {
  return !resource.restricted && contains(restrictedStatuses, newStatus);
}

export function isCodeSchemeStatusGettingChangedValidlySoThatWeNeedToAskDoCodesStatusesUpdatedToo(oldStatus: Status, newStatus: Status): Boolean {

  let result: Boolean = false;
  let fromStatuses = ['INCOMPLETE', 'DRAFT', 'VALID', 'RETIRED', 'INVALID'] as Status[];
  let toStatuses = ['INCOMPLETE', 'DRAFT', 'VALID', 'RETIRED', 'INVALID'] as Status[];

  let allowedTargetStatusesFrom_INCOMPLETE = ['DRAFT'] as Status[];
  let allowedTargetStatusesFrom_DRAFT = ['INCOMPLETE', 'VALID'] as Status[];
  let allowedTargetStatusesFrom_VALID = ['RETIRED', 'INVALID'] as Status[];
  let allowedTargetStatusesFrom_RETIRED = ['VALID', 'INVALID'] as Status[];
  let allowedTargetStatusesFrom_INVALID = ['VALID', 'RETIRED'] as Status[];

  if (fromStatuses.includes(oldStatus)) {
    if (oldStatus == 'INCOMPLETE' && allowedTargetStatusesFrom_INCOMPLETE.includes(newStatus)) {
      result = true;
    } else if (oldStatus == 'DRAFT' && allowedTargetStatusesFrom_DRAFT.includes(newStatus)) {
      result = true;
    } else if (oldStatus == 'VALID' && allowedTargetStatusesFrom_VALID.includes(newStatus)) {
      result = true;
    } else if (oldStatus == 'RETIRED' && allowedTargetStatusesFrom_RETIRED.includes(newStatus)) {
      result = true;
    } else if (oldStatus == 'INVALID' && allowedTargetStatusesFrom_INVALID.includes(newStatus)) {
      result = true;
    }
  }
  return result;
}


