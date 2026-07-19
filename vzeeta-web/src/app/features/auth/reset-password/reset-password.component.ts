import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    NgIf, ReactiveFormsModule, RouterLink, TranslateModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatProgressSpinnerModule,
    NabdLogoComponent
  ],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  form: FormGroup;
  loading = false;
  token = '';

  constructor(
    fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly auth: AuthService,
    private readonly snack: SnackService,
    private readonly i18n: I18nService
  ) {
    this.form = fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
  }

  submit(): void {
    if (!this.token || this.form.invalid || this.loading) return;
    const value = this.form.getRawValue();
    if (value.newPassword !== value.confirmPassword) {
      this.snack.error(this.i18n.instant('PROFILE.PASSWORD_MISMATCH'));
      return;
    }
    this.loading = true;
    this.auth.resetPassword(this.token, value.newPassword).subscribe({
      next: () => {
        this.snack.success(this.i18n.instant('PROFILE.PASSWORD_CHANGED'));
        void this.router.navigate(['/auth/login']);
      },
      error: (err: Error) => {
        this.snack.error(err.message);
        this.loading = false;
      }
    });
  }
}
