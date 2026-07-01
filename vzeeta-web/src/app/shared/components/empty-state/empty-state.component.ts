import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { I18nService } from '../../../core/i18n/i18n.service';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [NgIf, MatButtonModule],
  template: `
    <div class="empty-state">
      <img *ngIf="imageSrc" [src]="imageSrc" [alt]="titleText" class="empty-illustration" />
      <span *ngIf="!imageSrc && icon" class="material-icons empty-icon">{{ icon }}</span>
      <h3 *ngIf="titleText">{{ titleText }}</h3>
      <p *ngIf="messageText">{{ messageText }}</p>
      <button *ngIf="actionText" mat-flat-button color="primary" (click)="actionClick.emit()">
        {{ actionText }}
      </button>
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 48px 24px;
      gap: 12px;
    }
    .empty-illustration {
      width: min(240px, 80%);
      height: auto;
      margin-bottom: 8px;
    }
    .empty-icon {
      font-size: 56px;
      color: var(--blue-300);
      opacity: 0.6;
    }
    h3 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--ink-800);
    }
    p {
      margin: 0;
      max-width: 360px;
      font-size: 0.875rem;
      color: var(--ink-500);
      line-height: 1.5;
    }
  `]
})
export class EmptyStateComponent {
  @Input() imageSrc = '';
  @Input() icon = 'inbox';
  @Input() titleKey = 'COMMON.NO_DATA';
  @Input() messageKey = '';
  @Input() actionKey = '';
  @Output() actionClick = new EventEmitter<void>();

  constructor(private readonly i18n: I18nService) {}

  get titleText(): string {
    return this.i18n.label(this.titleKey);
  }

  get messageText(): string {
    return this.i18n.label(this.messageKey);
  }

  get actionText(): string {
    return this.i18n.label(this.actionKey);
  }
}
