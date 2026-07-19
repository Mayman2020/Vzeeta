import { Component, OnInit } from '@angular/core';
import { DecimalPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { SubscriptionPlan, SubscriptionService } from '../../../core/services/subscription.service';
import { SubscriptionPlanDialogComponent } from '../subscription-plan-dialog/subscription-plan-dialog.component';

@Component({
  selector: 'app-super-admin-subscription-plans',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, DecimalPipe, TranslateModule, MatButtonModule, MatIconModule, MatTooltipModule, MatProgressSpinnerModule, PageHeaderComponent, EmptyStateComponent],
  templateUrl: './super-admin-subscription-plans.component.html'
})
export class SuperAdminSubscriptionPlansComponent implements OnInit {
  loading = true;
  rows: SubscriptionPlan[] = [];

  private readonly dialogConfig = {
    width: '520px',
    maxWidth: '95vw',
    panelClass: 'app-dialog-panel',
    disableClose: true
  } as const;

  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly dialog: MatDialog
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.subscriptionService.getPlans().subscribe({
      next: (rows) => { this.rows = rows; this.loading = false; },
      error: () => { this.rows = []; this.loading = false; }
    });
  }

  openCreate(): void {
    this.dialog.open(SubscriptionPlanDialogComponent, { ...this.dialogConfig, data: { plan: null } })
      .afterClosed().subscribe((ok) => { if (ok) this.load(); });
  }

  openEdit(plan: SubscriptionPlan): void {
    this.dialog.open(SubscriptionPlanDialogComponent, { ...this.dialogConfig, data: { plan } })
      .afterClosed().subscribe((ok) => { if (ok) this.load(); });
  }
}
