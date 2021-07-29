/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}

declare var require: any;

declare module "*.po" {
  const content: string;
  export default content;
}