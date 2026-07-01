import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `<span class="status-badge" [attr.data-status]="status">{{ label }}</span>`,
  styles: [`
    .status-badge {
      display: inline-flex;
      align-items: center;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.02em;
      background: var(--gray-100);
      color: var(--gray-600);
    }
    .status-badge[data-status="ACTIVE"],
    .status-badge[data-status="APPROVED"],
    .status-badge[data-status="CONFIRMED"] {
      background: rgba(22,163,74,0.12);
      color: #15803d;
    }
    .status-badge[data-status="INACTIVE"],
    .status-badge[data-status="REJECTED"],
    .status-badge[data-status="CANCELLED"] {
      background: rgba(220,38,38,0.1);
      color: #dc2626;
    }
    .status-badge[data-status="PENDING"],
    .status-badge[data-status="PENDING_APPROVAL"] {
      background: rgba(234,179,8,0.15);
      color: #a16207;
    }
    .status-badge[data-status="COMPLETED"] {
      background: rgba(37,99,235,0.1);
      color: #1d4ed8;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatusBadgeComponent {
  @Input() status = '';
  @Input() label = '';
}
