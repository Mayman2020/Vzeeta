import { Injectable } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';

type ThemeMode = 'dark' | 'light';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'rms_theme';
  private mode: ThemeMode;

  constructor(private readonly overlayContainer: OverlayContainer) {
    this.mode = this.readSavedTheme();
    this.apply(this.mode);
  }

  get isDark(): boolean {
    return this.mode === 'dark';
  }

  toggle(): void {
    this.mode = this.mode === 'dark' ? 'light' : 'dark';
    this.apply(this.mode);
    localStorage.setItem(this.storageKey, this.mode);
  }

  setMode(mode: ThemeMode): void {
    this.mode = mode;
    this.apply(mode);
    localStorage.setItem(this.storageKey, mode);
  }

  private readSavedTheme(): ThemeMode {
    const saved = localStorage.getItem(this.storageKey);
    return saved === 'light' ? 'light' : 'dark';
  }

  private apply(mode: ThemeMode): void {
    const root = document.documentElement;
    const body = document.body;
    const dark = mode === 'dark';

    root.classList.toggle('dark-theme', dark);
    root.classList.toggle('light-theme', !dark);
    body.classList.toggle('dark-theme', dark);
    body.classList.toggle('light-theme', !dark);

    try {
      const overlay = this.overlayContainer.getContainerElement();
      overlay.classList.toggle('dark-theme', dark);
      overlay.classList.toggle('light-theme', !dark);
    } catch {
      // Overlay container can be unavailable during early bootstrap.
    }
  }
}
