import { Component, OnInit } from '@angular/core';
import { DecimalPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { UploadZoneComponent } from '../../../shared/components/upload-zone/upload-zone.component';
import { SubscriptionPlan, SubscriptionService } from '../../../core/services/subscription.service';
import { SnackService } from '../../../core/services/snack.service';
import { I18nService } from '../../../core/i18n/i18n.service';

@Component({
  selector: 'app-clinic-choose-plan',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, DecimalPipe, TranslateModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, PageHeaderComponent, UploadZoneComponent],
  templateUrl: './clinic-choose-plan.component.html'
})
export class ClinicChoosePlanComponent implements OnInit {
  loading = true;
  submitting = false;
  plans: SubscriptionPlan[] = [];
  selectedPlanId: number | null = null;
  paymentMethod: 'RECEIPT_UPLOAD' | 'ONLINE_PLACEHOLDER' = 'RECEIPT_UPLOAD';
  receiptUrls: string[] = [];
  doctorCount = 0;

  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly snack: SnackService,
    private readonly i18n: I18nService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.subscriptionService.getMyPlans().subscribe({
      next: (plans) => { this.plans = plans; this.loading = false; },
      error: () => { this.plans = []; this.loading = false; }
    });
    this.subscriptionService.getDoctorCount().subscribe({
      next: (count) => { this.doctorCount = count; },
      error: () => { this.doctorCount = 0; }
    });
  }

  selectPlan(planId: number): void {
    this.selectedPlanId = planId;
  }

  totalFor(plan: SubscriptionPlan): number {
    return plan.price * Math.max(this.doctorCount, 1);
  }

  onReceiptChange(urls: string[]): void {
    this.receiptUrls = urls;
  }

  get canSubmit(): boolean {
    if (!this.selectedPlanId) return false;
    if (this.paymentMethod === 'RECEIPT_UPLOAD') return this.receiptUrls.length > 0;
    return true;
  }

  submit(): void {
    if (!this.canSubmit || this.submitting) return;
    this.submitting = true;
    this.subscriptionService.submitPayment({
      planId: this.selectedPlanId!,
      paymentMethod: this.paymentMethod,
      receiptUrl: this.receiptUrls[0]
    }).subscribe({
      next: () => {
        this.submitting = false;
        this.snack.success(this.i18n.instant('SUBSCRIPTION.SUBMITTED_OK'));
        void this.router.navigate(['/clinic-admin/subscription']);
      },
      error: () => { this.submitting = false; }
    });
  }
}
