import { Component, OnInit } from '@angular/core';
import { DecimalPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { UploadZoneComponent } from '../../../shared/components/upload-zone/upload-zone.component';
import { RmsDatePipe } from '../../../shared/pipes/rms-date.pipe';
import { ClinicSubscription, SubscriptionService } from '../../../core/services/subscription.service';
import { DEFAULT_TABLE_PAGE_SIZE } from '../../../core/utils/pagination.util';
import { SnackService } from '../../../core/services/snack.service';
import { I18nService } from '../../../core/i18n/i18n.service';

@Component({
  selector: 'app-clinic-my-subscription',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, DecimalPipe, RouterLink, RmsDatePipe, TranslateModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, PageHeaderComponent, EmptyStateComponent, UploadZoneComponent],
  templateUrl: './clinic-my-subscription.component.html'
})
export class ClinicMySubscriptionComponent implements OnInit {
  loading = true;
  current: ClinicSubscription | null = null;
  history: ClinicSubscription[] = [];
  pendingCharge: ClinicSubscription | null = null;
  payingTopUp = false;
  topUpReceiptUrls: string[] = [];
  submittingTopUp = false;

  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly snack: SnackService,
    private readonly i18n: I18nService,
    private readonly router: Router
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.subscriptionService.getCurrent().subscribe({
      next: (current) => { this.current = current; this.loading = false; },
      error: () => { this.current = null; this.loading = false; }
    });
    this.subscriptionService.getHistory({ size: DEFAULT_TABLE_PAGE_SIZE }).subscribe({
      next: (res) => { this.history = res.content; },
      error: () => { this.history = []; }
    });
    this.subscriptionService.getPendingCharge().subscribe({
      next: (charge) => { this.pendingCharge = charge; },
      error: () => { this.pendingCharge = null; }
    });
  }

  get isActive(): boolean {
    return this.current?.status === 'ACTIVE';
  }

  choosePlan(): void {
    void this.router.navigate(['/clinic-admin/subscription/choose-plan']);
  }

  onTopUpReceiptChange(urls: string[]): void {
    this.topUpReceiptUrls = urls;
  }

  submitTopUpPayment(): void {
    if (!this.pendingCharge || this.topUpReceiptUrls.length === 0 || this.submittingTopUp) return;
    this.submittingTopUp = true;
    this.subscriptionService.submitPayment({
      subscriptionId: this.pendingCharge.id,
      paymentMethod: 'RECEIPT_UPLOAD',
      receiptUrl: this.topUpReceiptUrls[0]
    }).subscribe({
      next: () => {
        this.submittingTopUp = false;
        this.payingTopUp = false;
        this.snack.success(this.i18n.instant('SUBSCRIPTION.SUBMITTED_OK'));
        this.load();
      },
      error: () => { this.submittingTopUp = false; }
    });
  }
}
