import { Code } from '../entities/code';
import { CodeScheme } from '../entities/code-scheme';
import { ExtensionScheme } from '../entities/extension-scheme';
import { restrictedStatuses, Status } from 'yti-common-ui/entities/status';
import { contains } from 'yti-common-ui/utils/array';

export type ResourceWithStatus = Code | CodeScheme | ExtensionScheme;

export function changeToRestrictedStatus(resource: ResourceWithStatus, newStatus: Status): Boolean {
  return !resource.restricted && contains(restrictedStatuses, newStatus);
}
