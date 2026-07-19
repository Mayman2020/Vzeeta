import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';
import { SnackService } from '../../../core/services/snack.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { NabdLogoComponent } from '../../../shared/components/nabd-logo/nabd-logo.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    NgIf, ReactiveFormsModule, RouterLink, TranslateModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatProgressSpinnerModule,
    NabdLogoComponent
  ],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  form: FormGroup;
  loading = false;
  sent = false;

  constructor(
    fb: FormBuilder,
    private readonly auth: AuthService,
    private readonly snack: SnackService,
    private readonly i18n: I18nService
  ) {
    this.form = fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  submit(): void {
    if (this.form.invalid || this.loading) return;
    this.loading = true;
    this.auth.forgotPassword(this.form.value.email).subscribe({
      next: () => {
        this.sent = true;
        this.loading = false;
        this.snack.success(this.i18n.instant('AUTH.FORGOT_PASSWORD_SENT'));
      },
      error: (err: Error) => {
        this.snack.error(err.message);
        this.loading = false;
      }
    });
  }
}
