export interface ServiceConfiguration {

  groupManagementConfig: { url: string };
  dataModelConfig: { url: string };
  terminologyConfig: { url: string };
  env: string;
  defaultStatus?: string;
  codeSchemeSortMode?: string;
}
