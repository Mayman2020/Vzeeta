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
  template: `
    <div class="auth-shell">
      <div class="auth-card">
        <div class="auth-brand">
          <app-nabd-logo [size]="48"></app-nabd-logo>
          <h1>{{ 'AUTH.FORGOT_PASSWORD' | translate }}</h1>
          <p>{{ 'AUTH.FORGOT_PASSWORD_HINT' | translate }}</p>
        </div>
        <form [formGroup]="form" (ngSubmit)="submit()" *ngIf="!sent">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{ 'AUTH.EMAIL' | translate }}</mat-label>
            <input matInput type="email" formControlName="email" autocomplete="email">
          </mat-form-field>
          <button mat-flat-button color="primary" type="submit" class="full-width" [disabled]="form.invalid || loading">
            {{ 'AUTH.SEND_RESET_LINK' | translate }}
          </button>
        </form>
        <p class="success-msg" *ngIf="sent">{{ 'AUTH.FORGOT_PASSWORD_SENT' | translate }}</p>
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
    .success-msg { color: #16a34a; text-align: center; margin: 16px 0; }
    .back-link { text-align: center; margin-top: 16px; a { color: #2563eb; text-decoration: none; font-weight: 600; } }
    .loading-wrap { position: absolute; inset: 0; display: grid; place-items: center; background: rgba(255,255,255,0.7); border-radius: 16px; }
  `]
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
