import { Injectable } from '@angular/core';
import { AppConstants } from '../constants/app-constants';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  getToken(): string | null {
    return localStorage.getItem(AppConstants.PERSISTED_KEYS.ACCESS_TOKEN);
  }

  setToken(token: string): void {
    localStorage.setItem(AppConstants.PERSISTED_KEYS.ACCESS_TOKEN, token);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(AppConstants.PERSISTED_KEYS.REFRESH_TOKEN);
  }

  setRefreshToken(token: string): void {
    localStorage.setItem(AppConstants.PERSISTED_KEYS.REFRESH_TOKEN, token);
  }

  getUser<T>(): T | null {
    const raw = localStorage.getItem(AppConstants.PERSISTED_KEYS.CURRENT_USER);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  setUser<T>(user: T): void {
    localStorage.setItem(AppConstants.PERSISTED_KEYS.CURRENT_USER, JSON.stringify(user));
  }

  clearAll(): void {
    localStorage.removeItem(AppConstants.PERSISTED_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(AppConstants.PERSISTED_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(AppConstants.PERSISTED_KEYS.CURRENT_USER);
  }
}
