export type Status = 'SUPERSEDED'
                   | 'SUBMITTED'
                   | 'RETIRED'
                   | 'INVALID'
                   | 'VALID'
                   | 'DRAFT';

export const statuses: Status[] = ['SUPERSEDED', 'SUBMITTED', 'RETIRED', 'INVALID', 'VALID', 'DRAFT'];

export const statusList: string[] = ['DRAFT', 'SUBMITTED', 'VALID', 'SUPERSEDED', 'RETIRED', 'INVALID'];
