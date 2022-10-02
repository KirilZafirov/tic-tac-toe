import { Inject, Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { first } from 'rxjs/operators';

import { LOCAL_STORAGE } from './local-storage.token';

// See DOM / Storage type
// Custom referenced here as the goal is to have a generic type
// not only the type for the dom
export interface Storage {
  readonly length: number;

  clear(): void;

  getItem(key: string): string | null;

  key(index: number): string | null;

  removeItem(key: string): void;

  setItem(key: string, value: string): void;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [name: string]: any;
}

@Injectable()
export class LocalStorageService {
  constructor(@Inject(LOCAL_STORAGE) private readonly localStorage: Storage) {}
   

  public getItem<T>(key: string): T | null {
    const item = this.localStorage.getItem(key);
    if (item) {
      const parsedItem: T = JSON.parse(item) as T;
      return parsedItem;
    }
    return null;
  }

  public setItem<T>(key: string, item: T): T {
    this.localStorage.setItem(key, JSON.stringify(item));
    return item;
  }

  public removeItem(key: string): void {
    this.localStorage.removeItem(key);
  }

  public length(): number {
    return this.localStorage.length;
  }

  public key(index: number): string | null {
    return this.localStorage.key(index);
  }
}
