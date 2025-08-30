export interface IMetadataService<TMetadata> {
  getMetadata(): Promise<TMetadata>
  processMetadata(metadata: TMetadata, writeToFile: boolean): Promise<string>
}
