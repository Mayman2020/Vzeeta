import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
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
  selector: 'app-change-password',
  standalone: true,
  imports: [
    NgIf, ReactiveFormsModule, TranslateModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatProgressSpinnerModule,
    NabdLogoComponent
  ],
  template: `
    <div class="auth-shell">
      <div class="auth-card">
        <div class="auth-brand">
          <app-nabd-logo [size]="48"></app-nabd-logo>
          <h1>{{ 'PROFILE.CHANGE_PASSWORD' | translate }}</h1>
          <p>{{ 'PROFILE.CHANGE_PASSWORD_SUBTITLE' | translate }}</p>
        </div>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{ 'PROFILE.CURRENT_PASSWORD' | translate }}</mat-label>
            <input matInput type="password" formControlName="currentPassword" autocomplete="current-password">
          </mat-form-field>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{ 'PROFILE.NEW_PASSWORD' | translate }}</mat-label>
            <input matInput type="password" formControlName="newPassword" autocomplete="new-password">
          </mat-form-field>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{ 'PROFILE.CONFIRM_PASSWORD' | translate }}</mat-label>
            <input matInput type="password" formControlName="confirmPassword" autocomplete="new-password">
          </mat-form-field>
          <button mat-flat-button color="primary" type="submit" class="full-width" [disabled]="form.invalid || saving">
            {{ 'PROFILE.CHANGE_PASSWORD' | translate }}
          </button>
        </form>
        <div class="loading-wrap" *ngIf="saving"><mat-spinner diameter="32"></mat-spinner></div>
      </div>
    </div>
  `,
  styles: [`
    .auth-shell { min-height: 100vh; display: grid; place-items: center; padding: 24px; background: var(--bg, #f8fafc); }
    .auth-card { width: min(100%, 480px); background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 28px; box-shadow: 0 8px 24px rgba(15,23,42,0.06); position: relative; }
    .auth-brand { text-align: center; margin-bottom: 20px; h1 { margin: 12px 0 4px; font-size: 1.35rem; } p { margin: 0; color: #64748b; font-size: 0.9rem; } }
    form { display: flex; flex-direction: column; gap: 8px; }
    .full-width { width: 100%; }
    .loading-wrap { position: absolute; inset: 0; display: grid; place-items: center; background: rgba(255,255,255,0.7); border-radius: 16px; }
  `]
})
export class ChangePasswordComponent implements OnInit {
  form: FormGroup;
  saving = false;
  forced = false;

  constructor(
    fb: FormBuilder,
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly snack: SnackService,
    private readonly i18n: I18nService
  ) {
    this.form = fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    if (!this.auth.isAuthenticated()) {
      void this.router.navigate(['/auth/login']);
      return;
    }
    this.forced = this.auth.mustChangePassword();
  }

  submit(): void {
    if (this.form.invalid || this.saving) return;
    const value = this.form.getRawValue();
    if (value.newPassword !== value.confirmPassword) {
      this.snack.error(this.i18n.instant('PROFILE.PASSWORD_MISMATCH'));
      return;
    }
    this.saving = true;
    this.auth.changePassword({
      currentPassword: value.currentPassword,
      newPassword: value.newPassword
    }).subscribe({
      next: () => {
        this.snack.success(this.i18n.instant('PROFILE.PASSWORD_CHANGED'));
        void this.router.navigateByUrl(this.auth.getDashboardRoute());
      },
      error: (err: Error) => {
        this.snack.error(err.message);
        this.saving = false;
      }
    });
  }
}
