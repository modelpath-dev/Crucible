import { safeStorage } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

export class SecureStore {
  private storePath: string;
  private cache = new Map<string, string>();

  constructor() {
    this.storePath = path.join(app.getPath('userData'), 'secure-store.json');
    this.load();
  }

  private load(): void {
    try {
      const data = JSON.parse(fs.readFileSync(this.storePath, 'utf-8'));
      for (const [key, encrypted] of Object.entries(data)) {
        try {
          if (safeStorage.isEncryptionAvailable()) {
            const decrypted = safeStorage.decryptString(Buffer.from(encrypted as string, 'base64'));
            this.cache.set(key, decrypted);
          }
        } catch {
          // Skip corrupted entries
        }
      }
    } catch {
      // No store file yet
    }
  }

  private save(): void {
    const data: Record<string, string> = {};
    for (const [key, value] of this.cache) {
      if (safeStorage.isEncryptionAvailable()) {
        data[key] = safeStorage.encryptString(value).toString('base64');
      }
    }
    fs.writeFileSync(this.storePath, JSON.stringify(data, null, 2));
  }

  get(key: string): string | undefined {
    return this.cache.get(key);
  }

  set(key: string, value: string): void {
    this.cache.set(key, value);
    this.save();
  }

  delete(key: string): void {
    this.cache.delete(key);
    this.save();
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }
}
