
export interface EditableEntity {
  getOwningOrganizationIds(): string[];

  allowOrganizationEdit(): boolean;
}
