import { app } from 'electron';
import { promises as fs } from 'fs';
import * as path from 'path';

export class FileUtil {
  private static getUserDataDir(): string {
    return app.getPath('userData');
  }

  private static resolvePath(relativeFilePath: string): string {
    return path.join(this.getUserDataDir(), relativeFilePath);
  }

  static async write(relativeFilePath: string, content: string): Promise<void> {
    const fullPath = this.resolvePath(relativeFilePath);

    try {
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, content, 'utf-8');
    } catch (err) {
      console.error(`Error writing to file at ${fullPath}`, err);
      throw err;
    }
  }

  static async read(relativeFilePath: string): Promise<string | null> {
    const fullPath = this.resolvePath(relativeFilePath);

    try {
      return await fs.readFile(fullPath, 'utf-8');
    } catch (err: any) {
      if (err.code === 'ENOENT') return null;
      console.error(`Error reading file at ${fullPath}`, err);
      throw err;
    }
  }

  static getAbsolutePath(relativeFilePath: string): string {
    return this.resolvePath(relativeFilePath);
  }
}