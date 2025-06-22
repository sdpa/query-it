export interface IMetadataService<TMetadata> {
  getMetadata(): Promise<TMetadata>;
}

