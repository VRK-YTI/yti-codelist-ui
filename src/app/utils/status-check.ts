import { Code } from '../entities/code';
import { CodeScheme } from '../entities/code-scheme';
import { Extension } from '../entities/extension';
import { restrictedStatuses, Status } from 'yti-common-ui/entities/status';
import { contains } from 'yti-common-ui/utils/array';

export type ResourceWithStatus = Code | CodeScheme | Extension;

export function changeToRestrictedStatus(resource: ResourceWithStatus, newStatus: Status): Boolean {
  return !resource.restricted && contains(restrictedStatuses, newStatus);
}
