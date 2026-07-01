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
  template: `
    <div class="auth-shell">
      <div class="auth-card">
        <div class="auth-brand">
          <app-nabd-logo [size]="48"></app-nabd-logo>
          <h1>{{ 'AUTH.RESET_PASSWORD' | translate }}</h1>
          <p>{{ 'AUTH.RESET_PASSWORD_HINT' | translate }}</p>
        </div>
        <form [formGroup]="form" (ngSubmit)="submit()" *ngIf="token">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{ 'PROFILE.NEW_PASSWORD' | translate }}</mat-label>
            <input matInput type="password" formControlName="newPassword" autocomplete="new-password">
          </mat-form-field>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{ 'PROFILE.CONFIRM_PASSWORD' | translate }}</mat-label>
            <input matInput type="password" formControlName="confirmPassword" autocomplete="new-password">
          </mat-form-field>
          <button mat-flat-button color="primary" type="submit" class="full-width" [disabled]="form.invalid || loading">
            {{ 'AUTH.RESET_PASSWORD' | translate }}
          </button>
        </form>
        <p class="error-msg" *ngIf="!token">{{ 'AUTH.RESET_TOKEN_MISSING' | translate }}</p>
        <div class="loading-wrap" *ngIf="loading"><mat-spinner diameter="32"></mat-spinner></div>
        <p class="back-link"><a routerLink="/auth/login">{{ 'AUTH.BACK_TO_LOGIN' | translate }}</a></p>
      </div>
    </div>
  `,
  styles: [`
    .auth-shell { min-height: 100vh; display: grid; place-items: center; padding: 24px; background: var(--bg, #f8fafc); }
    .auth-card { width: min(100%, 480px); background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 28px; box-shadow: 0 8px 24px rgba(15,23,42,0.06); position: relative; }
    .auth-brand { text-align: center; margin-bottom: 20px; h1 { margin: 12px 0 4px; font-size: 1.35rem; } p { margin: 0; color: #64748b; font-size: 0.9rem; } }
    form { display: flex; flex-direction: column; gap: 8px; }
    .full-width { width: 100%; }
    .error-msg { color: #ef4444; text-align: center; }
    .back-link { text-align: center; margin-top: 16px; a { color: #2563eb; text-decoration: none; font-weight: 600; } }
    .loading-wrap { position: absolute; inset: 0; display: grid; place-items: center; background: rgba(255,255,255,0.7); border-radius: 16px; }
  `]
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
