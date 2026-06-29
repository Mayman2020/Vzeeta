import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { TranslateModule } from '@ngx-translate/core';
import { switchMap, timeout } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { PermissionService } from '../../../core/services/permission.service';
import { SnackService } from '../../../core/services/snack.service';
import { I18nService, LangCode, LanguageOption } from '../../../core/i18n/i18n.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    NgFor, NgIf, ReactiveFormsModule, FormsModule, RouterLink, TranslateModule,
    MatMenuModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  showPassword = false;
  rememberMe = false;
  error = '';
  private returnUrl: string | null = null;

  constructor(
    fb: FormBuilder,
    private readonly auth: AuthService,
    private readonly permissions: PermissionService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly snack: SnackService,
    readonly i18n: I18nService,
    readonly theme: ThemeService
  ) {
    this.form = fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
    this.returnUrl = this.getSafeReturnUrl(this.route.snapshot.queryParamMap.get('returnUrl'));
    // إذا اليوزر logged in بالفعل، ودّيه للـ dashboard على طول
    if (this.auth.isAuthenticated()) {
      void this.router.navigateByUrl(this.auth.getDashboardRoute());
    }
  }

  submit(): void {
    if (this.form.invalid || this.loading) return;
    this.loading = true;
    this.error = '';
    this.auth.login(this.form.value).pipe(
      timeout(15000),
      switchMap(() => this.permissions.loadMine())
    ).subscribe({
      next: () => {
        this.loading = false;
        const target = this.auth.mustChangePassword()
          ? '/super-admin/profile?changePassword=1'
          : (this.returnUrl || this.auth.getDashboardRoute());
        // استخدام window.location لضمان full navigation بعد اللوجين
        window.location.href = target;
      },
      error: (err: Error & { status?: number }) => {
        this.loading = false;
        // لو الـ login نجح لكن الـ permissions فشلت، كمّل للـ dashboard
        if (this.auth.isAuthenticated()) {
          const target = this.auth.mustChangePassword()
            ? '/super-admin/profile?changePassword=1'
            : (this.returnUrl || this.auth.getDashboardRoute());
          window.location.href = target;
          return;
        }
        this.error = err.status === 401 || err.status === 400
          ? this.i18n.instant('AUTH.INVALID_CREDENTIALS')
          : err.message || this.i18n.instant('AUTH.LOGIN_FAILED');
        this.snack.error(this.error);
      }
    });
  }

  get languages(): LanguageOption[] {
    return this.i18n.languages;
  }

  get activeLanguage(): LanguageOption {
    return this.languages.find((lang) => lang.code === this.i18n.currentLang) ?? this.languages[0];
  }

  setLang(code: LangCode): void {
    this.i18n.setLang(code).subscribe();
  }

  get themeTooltipKey(): string {
    return this.theme.isDark ? 'TOPBAR.LIGHT_MODE' : 'TOPBAR.DARK_MODE';
  }

  private getSafeReturnUrl(returnUrl: string | null): string | null {
    if (!returnUrl || !returnUrl.startsWith('/') || returnUrl.startsWith('/auth')) {
      return null;
    }
    return returnUrl;
  }
}
