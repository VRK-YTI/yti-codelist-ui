import { Organization } from "./organization";

/**
 * Returns unique list of main organizations
 *
 * @param organizations
 * @returns
 */
export function getMainOrganizations(organizations: Organization[]): Organization[] {
  const allMainOrganizations = organizations.reduce((result: Organization[], org: Organization) => {
    if (org.parent) {
      result.push(org.parent);
    } else {
      result.push(org);
    }
    return result;
  }, []);

  return allMainOrganizations.filter((org, idx, array) => {
    return array.findIndex(o => o.id === org.id) === idx;
  });
}

/**
 * Returns organization id list which includes also organizations' parent ids
 *
 * @param organizations
 * @returns
 */
export function getAllOrganizationIds(organizations: Organization[]) {
  return organizations.reduce((organizationIds: string[], org: Organization) => {
    if (org.parent) {
      organizationIds.push(org.parent.id);
    }
    organizationIds.push(org.id);
    return organizationIds;
  }, []);
}
