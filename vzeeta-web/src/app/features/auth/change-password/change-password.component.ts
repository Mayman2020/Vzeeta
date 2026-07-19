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
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
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
