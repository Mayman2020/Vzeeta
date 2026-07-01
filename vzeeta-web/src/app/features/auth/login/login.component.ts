import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';
import { SnackService } from '../../../core/services/snack.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { NabdLogoComponent } from '../../../shared/components/nabd-logo/nabd-logo.component';
import { SoundToggleComponent } from '../../../shared/components/sound-toggle/sound-toggle.component';
import { BackgroundMusicService } from '../../../core/services/background-music.service';
import { UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, RouterLink, TranslateModule, NabdLogoComponent, SoundToggleComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  showPassword = false;
  error = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly snack: SnackService,
    readonly i18n: I18nService,
    private readonly _music: BackgroundMusicService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  get emailCtrl() { return this.form.get('email')!; }
  get passwordCtrl() { return this.form.get('password')!; }

  submit(): void {
    if (this.form.invalid || this.loading) return;
    this.loading = true;
    this.error = '';

    this.auth.login(this.form.value).subscribe({
      next: () => {
        this.loading = false;
        const target = this.auth.mustChangePassword()
          ? this.auth.getChangePasswordRoute()
          : this.resolvePostLoginTarget();
        window.location.assign(target);
      },
      error: (err: Error & { status?: number }) => {
        this.loading = false;
        this.error = err?.status === 401 || err?.status === 400
          ? this.i18n.instant('AUTH.INVALID_CREDENTIALS')
          : err.message || this.i18n.instant('AUTH.LOGIN_FAILED');
        this.snack.error(this.error);
      }
    });
  }

  private resolvePostLoginTarget(): string {
    const role = this.auth.getRole();
    const dashboard = this.auth.getDashboardRoute();
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '';

    if (!returnUrl.startsWith('/') || returnUrl.startsWith('/auth')) {
      return dashboard;
    }
    if (this.isReturnUrlAllowedForRole(returnUrl, role)) {
      return returnUrl;
    }
    return dashboard;
  }

  private isReturnUrlAllowedForRole(returnUrl: string, role: UserRole | null): boolean {
    if (!role) return false;
    if (returnUrl.startsWith('/booking/')) return role === 'PATIENT';
    if (returnUrl.startsWith('/patient')) return role === 'PATIENT';
    if (returnUrl.startsWith('/doctor')) return role === 'DOCTOR';
    if (returnUrl.startsWith('/clinic-admin')) return role === 'CLINIC_ADMIN';
    if (returnUrl.startsWith('/super-admin')) return role === 'SUPER_ADMIN';
    return false;
  }
}
