export interface ServiceConfiguration {

  groupManagementConfig: { url: string };
  dataModelConfig: { url: string };
  terminologyConfig: { url: string };
  commentsConfig: { url: string };
  messagingConfig: { enabled: boolean };
  env: string;
  defaultStatus?: string;
  codeSchemeSortMode?: string;
}
