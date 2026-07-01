import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { BackgroundMusicService } from '../../../core/services/background-music.service';

@Component({
  selector: 'app-sound-toggle',
  standalone: true,
  imports: [NgIf, TranslateModule, MatTooltipModule],
  template: `
    <button
      class="tb-action-btn tb-theme-btn tb-sound-btn"
      type="button"
      [class.is-muted]="music.isMuted"
      (click)="music.toggleMute()"
      [matTooltip]="music.muteTooltipKey | translate"
      [attr.aria-label]="music.muteTooltipKey | translate"
      [attr.aria-pressed]="music.isMuted">
      <span class="tb-sound-icon-wrap">
        <span class="material-icons">headphones</span>
        <span *ngIf="music.isMuted" class="tb-sound-muted-mark" aria-hidden="true"></span>
      </span>
    </button>
  `,
  styleUrl: './sound-toggle.component.scss'
})
export class SoundToggleComponent {
  constructor(readonly music: BackgroundMusicService) {}
}
