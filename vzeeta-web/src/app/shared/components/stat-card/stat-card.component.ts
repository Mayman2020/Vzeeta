import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [NgClass, NgIf],
  template: `
    <div class="stat-card">
      <div class="stat-icon" [ngClass]="iconClass">
        <span class="material-icons">{{ icon }}</span>
      </div>
      <div class="stat-content">
        <div class="stat-value">{{ value }}</div>
        <div class="stat-label">{{ label }}</div>
        <div class="stat-trend" [ngClass]="trend >= 0 ? 'up' : 'down'" *ngIf="showTrend">
          <span class="material-icons" style="font-size:14px">{{ trend >= 0 ? 'trending_up' : 'trending_down' }}</span>
          {{ mathAbs(trend) }}%
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stat-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: var(--white, #fff);
      border: 1px solid var(--gray-200, #e5e7eb);
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    }
    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: grid;
      place-items: center;
      background: var(--blue-50, #eff6ff);
      color: var(--blue-600, #2563eb);
      flex-shrink: 0;
    }
    .stat-icon .material-icons { font-size: 24px; }
    .stat-value {
      font-size: 1.6rem;
      font-weight: 700;
      color: var(--gray-900, #111827);
      line-height: 1;
    }
    .stat-label {
      font-size: 0.8rem;
      color: var(--gray-500, #6b7280);
      margin-top: 4px;
    }
    .stat-trend {
      display: flex;
      align-items: center;
      gap: 3px;
      font-size: 0.75rem;
      font-weight: 600;
      margin-top: 4px;
    }
    .stat-trend.up { color: #16a34a; }
    .stat-trend.down { color: #dc2626; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatCardComponent {
  @Input() icon = 'info';
  @Input() iconClass = '';
  @Input() value: string | number = 0;
  @Input() label = '';
  @Input() trend = 0;
  @Input() showTrend = false;

  mathAbs(n: number): number { return Math.abs(n); }
}
