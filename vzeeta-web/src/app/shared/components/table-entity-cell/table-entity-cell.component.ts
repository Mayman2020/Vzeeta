import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-table-entity-cell',
  standalone: true,
  imports: [NgIf, MatIconModule],
  template: `
    <div class="table-entity-cell">
      <img *ngIf="imageUrl" [src]="imageUrl" class="table-entity-avatar" alt="">
      <span class="table-entity-initial" *ngIf="!imageUrl && initial">{{ initial }}</span>
      <span class="table-entity-icon-wrap" *ngIf="!imageUrl && !initial && icon">
        <mat-icon class="table-entity-icon">{{ icon }}</mat-icon>
      </span>
      <div class="table-entity-copy">
        <strong>{{ title }}</strong>
        <span class="table-entity-subtitle" *ngIf="subtitle">{{ subtitle }}</span>
      </div>
    </div>
  `,
  styles: [`
    .table-entity-cell {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .table-entity-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      object-fit: cover;
      flex-shrink: 0;
      border: 1px solid var(--gray-200, #e5e7eb);
    }
    .table-entity-initial {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--blue-100, #dbeafe);
      color: var(--blue-700, #1d4ed8);
      display: grid;
      place-items: center;
      font-size: 13px;
      font-weight: 700;
      flex-shrink: 0;
    }
    .table-entity-icon-wrap {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: var(--gray-100, #f3f4f6);
      display: grid;
      place-items: center;
      flex-shrink: 0;
    }
    .table-entity-icon { font-size: 20px; color: var(--gray-500, #6b7280); }
    .table-entity-copy {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }
    .table-entity-copy strong {
      font-size: 14px;
      font-weight: 600;
      color: var(--gray-900, #111827);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .table-entity-subtitle {
      font-size: 12px;
      color: var(--gray-500, #6b7280);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableEntityCellComponent {
  @Input({ required: true }) title = '';
  @Input() subtitle?: string;
  @Input() imageUrl?: string | null;
  @Input() initial?: string;
  @Input() icon?: string;
}
