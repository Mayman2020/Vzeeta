import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BackgroundMusicService {
  private readonly storageKey = 'tb_bg_music_muted';
  private readonly audioSrc = 'assets/music/background.mp3';
  private readonly audio: HTMLAudioElement | null;
  private readonly mutedSubject = new BehaviorSubject(false);
  private interactionBound = false;
  private started = false;

  readonly muted$ = this.mutedSubject.asObservable();

  constructor() {
    if (typeof window === 'undefined') {
      this.audio = null;
      return;
    }

    const savedMuted = localStorage.getItem(this.storageKey) === 'true';
    this.audio = new Audio(this.audioSrc);
    this.audio.loop = true;
    this.audio.preload = 'auto';
    this.audio.volume = 0.45;
    this.applyMuted(savedMuted, false);
    this.bindInteractionRetry();
    void this.tryStart();
  }

  get isMuted(): boolean {
    return this.mutedSubject.value;
  }

  get muteTooltipKey(): string {
    return this.isMuted ? 'TOPBAR.UNMUTE_SOUND' : 'TOPBAR.MUTE_SOUND';
  }

  toggleMute(): void {
    this.applyMuted(!this.isMuted, true);
    if (!this.isMuted) {
      void this.tryStart();
    }
  }

  private applyMuted(muted: boolean, persist: boolean): void {
    if (this.audio) {
      this.audio.muted = muted;
    }
    this.mutedSubject.next(muted);
    if (persist) {
      localStorage.setItem(this.storageKey, String(muted));
    }
  }

  private async tryStart(): Promise<void> {
    if (!this.audio || this.isMuted || this.started) return;
    try {
      await this.audio.play();
      this.started = true;
    } catch {
      // Autoplay blocked until the user interacts with the page.
    }
  }

  private bindInteractionRetry(): void {
    if (this.interactionBound || typeof document === 'undefined') return;
    this.interactionBound = true;

    const onInteraction = (): void => {
      void this.tryStart();
      document.removeEventListener('pointerdown', onInteraction);
      document.removeEventListener('keydown', onInteraction);
    };

    document.addEventListener('pointerdown', onInteraction, { passive: true });
    document.addEventListener('keydown', onInteraction, { passive: true });
  }
}
