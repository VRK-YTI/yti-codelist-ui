import { Role } from "@vrk-yti/yti-common-ui";

export interface UserRequest {
  organizationId: string;
  role: Role[];
}
