import { NgIf } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { DialogTitleCloseDirective } from '../../../shared/directives/dialog-title-close.directive';
import { SubscriptionService } from '../../../core/services/subscription.service';
import { SnackService } from '../../../core/services/snack.service';
import { I18nService } from '../../../core/i18n/i18n.service';

export interface GrantTrialDialogData {
  clinicId: number;
  clinicName: string;
}

@Component({
  selector: 'app-grant-trial-dialog',
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslateModule,
    DialogTitleCloseDirective
  ],
  templateUrl: './grant-trial-dialog.component.html'
})
export class GrantTrialDialogComponent {
  saving = false;
  readonly form: FormGroup;

  constructor(
    readonly ref: MatDialogRef<GrantTrialDialogComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) readonly data: GrantTrialDialogData,
    private readonly fb: FormBuilder,
    private readonly subscriptionService: SubscriptionService,
    private readonly snack: SnackService,
    private readonly i18n: I18nService
  ) {
    this.form = this.fb.group({
      months: [3, [Validators.required, Validators.min(1), Validators.max(12)]]
    });
  }

  save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.saving) return;
    this.saving = true;
    this.subscriptionService.grantTrial(this.data.clinicId, this.form.value.months).subscribe({
      next: () => {
        this.saving = false;
        this.snack.success(this.i18n.instant('SUBSCRIPTION.TRIAL_GRANTED'));
        this.ref.close(true);
      },
      error: () => { this.saving = false; }
    });
  }
}
