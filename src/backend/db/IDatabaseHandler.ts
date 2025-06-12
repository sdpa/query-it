export interface IDatabaseHandler {
  connect(config: any): Promise<any>;
}