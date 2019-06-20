export interface ServiceConfiguration {

  groupManagementConfig: { url: string };
  dataModelConfig: { url: string };
  terminologyConfig: { url: string };
  commentsConfig: { url: string };
  env: string;
  defaultStatus?: string;
  codeSchemeSortMode?: string;
}
