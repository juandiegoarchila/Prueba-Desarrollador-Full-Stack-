import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private _storage: Storage | null = null;
  private _initPromise: Promise<void>;

  constructor(private storage: Storage) {
    this._initPromise = this.init();
  }

  async init() {
    const storage = await this.storage.create();
    this._storage = storage;
  }

  public async set(key: string, value: any) {
    await this._initPromise;
    return this._storage?.set(key, value);
  }

  public async get(key: string) {
    await this._initPromise;
    return this._storage?.get(key);
  }
  
  public async remove(key: string) {
      await this._initPromise;
      return this._storage?.remove(key);
  }

  public async clear() {
      await this._initPromise;
      return this._storage?.clear();
  }
}
