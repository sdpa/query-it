import * as fs from 'fs/promises'
import { IMetadataService } from './IMetadataService'

export abstract class BaseMetadataService<TMetadata> implements IMetadataService<TMetadata> {
  abstract getMetadata(): Promise<TMetadata>
  abstract processMetadata(metadata: TMetadata, writeToFile: boolean): Promise<string>
  protected abstract getMetadataFilePath(): string

  async writeMetadataToFile(metadata: TMetadata): Promise<void> {
    const filePath = this.getMetadataFilePath()
    await fs.writeFile(filePath, JSON.stringify(metadata, null, 2), 'utf-8')
  }

  async readMetadataFromFile(): Promise<TMetadata | null> {
    const filePath = this.getMetadataFilePath()
    try {
      const data = await fs.readFile(filePath, 'utf-8')
      return JSON.parse(data) as TMetadata
    } catch {
      return null
    }
  }
}
