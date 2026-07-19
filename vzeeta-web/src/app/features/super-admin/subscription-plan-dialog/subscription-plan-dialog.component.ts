import { NgIf } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { DialogTitleCloseDirective } from '../../../shared/directives/dialog-title-close.directive';
import { SubscriptionPlan, SubscriptionService } from '../../../core/services/subscription.service';
import { SnackService } from '../../../core/services/snack.service';
import { I18nService } from '../../../core/i18n/i18n.service';

export interface SubscriptionPlanDialogData {
  plan: SubscriptionPlan | null;
}

@Component({
  selector: 'app-subscription-plan-dialog',
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslateModule,
    DialogTitleCloseDirective
  ],
  templateUrl: './subscription-plan-dialog.component.html'
})
export class SubscriptionPlanDialogComponent {
  saving = false;
  readonly form: FormGroup;

  constructor(
    readonly ref: MatDialogRef<SubscriptionPlanDialogComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) readonly data: SubscriptionPlanDialogData,
    private readonly fb: FormBuilder,
    private readonly subscriptionService: SubscriptionService,
    private readonly snack: SnackService,
    private readonly i18n: I18nService
  ) {
    const plan = data.plan;
    this.form = this.fb.group({
      nameAr: [plan?.nameAr ?? '', Validators.required],
      nameEn: [plan?.nameEn ?? ''],
      billingCycle: [plan?.billingCycle ?? 'MONTHLY', Validators.required],
      price: [plan?.price ?? 0, [Validators.required, Validators.min(0)]],
      sortOrder: [plan?.sortOrder ?? 0],
      active: [plan?.active ?? true]
    });
  }

  save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.saving) return;
    this.saving = true;
    const payload = {
      ...this.form.getRawValue(),
      ...(this.data.plan ? { id: this.data.plan.id } : {})
    };
    this.subscriptionService.savePlan(payload).subscribe({
      next: () => {
        this.saving = false;
        this.snack.success(this.i18n.instant('SUBSCRIPTION.PLAN_SAVED'));
        this.ref.close(true);
      },
      error: () => { this.saving = false; }
    });
  }
}
