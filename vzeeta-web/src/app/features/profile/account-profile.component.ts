import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { AuthService } from '../../core/services/auth.service';
import { UserProfileService } from '../../core/services/user-profile.service';
import { SnackService } from '../../core/services/snack.service';
import { I18nService } from '../../core/i18n/i18n.service';

@Component({
  selector: 'app-account-profile',
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    RouterLink,
    TranslateModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    PageHeaderComponent
  ],
  template: `
    <div class="app-page profile-page">
      <div class="loading-center" *ngIf="loading">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <ng-container *ngIf="!loading">
        <app-page-header
          titleKey="PROFILE.TITLE"
          subtitleKey="PROFILE.SUBTITLE">
        </app-page-header>

        <div class="profile-layout">
          <div class="profile-main">
            <section class="app-card profile-hero" aria-labelledby="profile-hero-name">
              <div class="profile-hero__avatar-wrap">
                <img
                  *ngIf="heroProfileImageUrl as u"
                  class="profile-hero__avatar"
                  [src]="u"
                  [attr.alt]="'PROFILE.AVATAR_ALT' | translate">
                <div *ngIf="!heroProfileImageUrl" class="profile-hero__avatar profile-hero__avatar--initials" aria-hidden="true">
                  {{ heroInitials() }}
                </div>
              </div>
              <div class="profile-hero__meta">
                <h2 id="profile-hero-name" class="profile-hero__name">{{ profileDisplayName() || ('PROFILE.DEFAULT_USER' | translate) }}</h2>
                <p class="profile-hero__email" *ngIf="accountEmail">
                  <span class="material-icons profile-hero__ico">mail_outline</span>
                  <span>{{ accountEmail }}</span>
                </p>
                <p class="profile-hero__hint">{{ 'PROFILE.EMAIL_READONLY_HINT' | translate }}</p>
                <div class="profile-hero__chips">
                  <span class="role-chip" *ngIf="roleLabel()">{{ roleLabel() }}</span>
                </div>
              </div>
            </section>

            <section class="app-card security-card" [class.highlight]="highlightPassword">
              <div class="card-head">
                <div class="card-head-icon-wrap">
                  <span class="material-icons">manage_accounts</span>
                </div>
                <div>
                  <div class="card-eyebrow">{{ 'PROFILE.SECTION_PROFILE' | translate }}</div>
                  <h3 class="card-title">{{ 'PROFILE.YOUR_DETAILS' | translate }}</h3>
                </div>
              </div>

              <form [formGroup]="form" (ngSubmit)="save()" class="pf-form">
                <div class="field-row">
                  <div class="field-group">
                    <label class="field-label">{{ 'PROFILE.FULL_NAME_AR' | translate }}</label>
                    <div class="input-wrap">
                      <span class="material-icons input-ico">person_outline</span>
                      <input class="pf-input" type="text" formControlName="fullNameAr" dir="rtl">
                    </div>
                  </div>
                  <div class="field-group">
                    <label class="field-label">{{ 'PROFILE.FULL_NAME_EN' | translate }}</label>
                    <div class="input-wrap">
                      <span class="material-icons input-ico">person_outline</span>
                      <input class="pf-input" type="text" formControlName="fullNameEn" dir="ltr">
                    </div>
                  </div>
                </div>

                <div class="field-row field-row--triple">
                  <div class="field-group">
                    <label class="field-label">{{ 'PROFILE.ACCOUNT_EMAIL' | translate }}</label>
                    <div class="input-wrap">
                      <span class="material-icons input-ico">alternate_email</span>
                      <input class="pf-input pf-input--readonly" type="email" [value]="accountEmail" readonly tabindex="-1">
                    </div>
                  </div>
                  <div class="field-group">
                    <label class="field-label">{{ 'PROFILE.PHONE' | translate }}</label>
                    <div class="input-wrap">
                      <span class="material-icons input-ico">phone_iphone</span>
                      <input class="pf-input" type="text" formControlName="phone">
                    </div>
                  </div>
                </div>

                <div class="form-actions">
                  <button mat-stroked-button type="button" [routerLink]="dashboardRoute">{{ 'ACTIONS.CANCEL' | translate }}</button>
                  <button mat-flat-button color="primary" type="submit" class="btn-save" [disabled]="form.invalid || saving">
                    <mat-spinner *ngIf="saving" diameter="18"></mat-spinner>
                    <ng-container *ngIf="!saving">
                      <span class="material-icons btn-ico">save</span>
                      {{ 'PROFILE.SAVE_BUTTON' | translate }}
                    </ng-container>
                  </button>
                </div>
              </form>
            </section>
          </div>

          <aside class="profile-aside">
            <section class="app-card security-card">
              <div class="card-head">
                <div class="card-head-icon-wrap security-ico-wrap">
                  <span class="material-icons">lock_outline</span>
                </div>
                <div>
                  <div class="card-eyebrow">{{ 'PROFILE.SECTION_SECURITY' | translate }}</div>
                  <h3 class="card-title">{{ 'PROFILE.CHANGE_PASSWORD' | translate }}</h3>
                </div>
              </div>

              <form [formGroup]="passwordForm" (ngSubmit)="changePassword()" class="pf-form">
                <div class="field-group">
                  <label class="field-label">{{ 'PROFILE.CURRENT_PASSWORD' | translate }}</label>
                  <div class="input-wrap">
                    <span class="material-icons input-ico">lock</span>
                    <input class="pf-input" type="password" formControlName="currentPassword" autocomplete="current-password">
                  </div>
                </div>
                <div class="field-group">
                  <label class="field-label">{{ 'PROFILE.NEW_PASSWORD' | translate }}</label>
                  <div class="input-wrap">
                    <span class="material-icons input-ico">lock_open</span>
                    <input class="pf-input" type="password" formControlName="newPassword" autocomplete="new-password">
                  </div>
                </div>
                <div class="field-group">
                  <label class="field-label">{{ 'PROFILE.CONFIRM_PASSWORD' | translate }}</label>
                  <div class="input-wrap">
                    <span class="material-icons input-ico">verified</span>
                    <input class="pf-input" type="password" formControlName="confirmPassword" autocomplete="new-password">
                  </div>
                </div>
                <div class="pw-hint">
                  <span class="material-icons">info_outline</span>
                  {{ 'PROFILE.PASSWORD_HINT' | translate }}
                </div>
                <div class="form-actions form-actions--single">
                  <button mat-flat-button color="primary" type="submit" class="btn-security"
                    [disabled]="passwordForm.invalid || changingPassword">
                    <mat-spinner *ngIf="changingPassword" diameter="18"></mat-spinner>
                    <ng-container *ngIf="!changingPassword">
                      <span class="material-icons btn-ico">key</span>
                      {{ 'PROFILE.CHANGE_PASSWORD_BUTTON' | translate }}
                    </ng-container>
                  </button>
                </div>
              </form>
            </section>
          </aside>
        </div>
      </ng-container>
    </div>
  `
})
export class AccountProfileComponent implements OnInit {
  form: FormGroup;
  passwordForm: FormGroup;
  loading = false;
  saving = false;
  changingPassword = false;
  highlightPassword = false;
  accountEmail = '';
  dashboardRoute = '/';

  constructor(
    private readonly fb: FormBuilder,
    private readonly profileService: UserProfileService,
    private readonly auth: AuthService,
    private readonly snack: SnackService,
    private readonly i18n: I18nService,
    private readonly route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      fullNameAr: ['', [Validators.required, Validators.maxLength(150)]],
      fullNameEn: ['', [Validators.maxLength(150)]],
      phone: ['', [Validators.maxLength(20)]],
      profileImage: ['', [Validators.maxLength(500)]]
    });
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.dashboardRoute = this.auth.getDashboardRoute();
    this.highlightPassword = this.route.snapshot.queryParamMap.get('changePassword') === '1';
    this.loadProfile();
  }

  get heroProfileImageUrl(): string | null {
    const v = (this.form.get('profileImage')?.value as string | undefined)?.trim();
    return v || null;
  }

  heroInitials(): string {
    return this.auth.getCurrentUser()?.initials || 'U';
  }

  roleLabel(): string {
    const role = this.auth.getRole();
    return role ? this.i18n.instant(`ROLES.${role}`) : '';
  }

  profileDisplayName(): string {
    const ar = (this.form.get('fullNameAr')?.value as string | undefined)?.trim();
    const en = (this.form.get('fullNameEn')?.value as string | undefined)?.trim();
    return this.i18n.currentLang === 'ar' ? (ar || en || '') : (en || ar || '');
  }

  save(): void {
    if (this.form.invalid || this.saving) return;
    this.saving = true;
    const v = this.form.getRawValue();
    this.profileService.updateMyProfile({
      fullNameAr: (v.fullNameAr as string).trim(),
      fullNameEn: (v.fullNameEn as string)?.trim() || undefined,
      phone: (v.phone as string)?.trim() || undefined,
      profileImage: (v.profileImage as string)?.trim() || undefined
    }).subscribe({
      next: (dto) => {
        this.auth.syncCurrentUserFromDto(dto);
        this.saving = false;
        this.snack.success(this.i18n.instant('PROFILE.SAVE_SUCCESS'));
      },
      error: (err: Error) => {
        this.saving = false;
        this.snack.error(err.message || this.i18n.instant('PROFILE.SAVE_ERROR'));
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid || this.changingPassword) return;
    const { newPassword, confirmPassword, currentPassword } = this.passwordForm.getRawValue();
    if (newPassword !== confirmPassword) {
      this.snack.error(this.i18n.instant('PROFILE.PASSWORD_MISMATCH'));
      return;
    }
    this.changingPassword = true;
    this.auth.changePassword({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.changingPassword = false;
        this.highlightPassword = false;
        this.auth.clearMustChangePassword();
        this.passwordForm.reset();
        this.snack.success(this.i18n.instant('PROFILE.PASSWORD_CHANGED'));
      },
      error: (err: Error) => {
        this.changingPassword = false;
        this.snack.error(err.message || this.i18n.instant('PROFILE.PASSWORD_CHANGE_ERROR'));
      }
    });
  }

  private loadProfile(): void {
    this.loading = true;
    this.profileService.getMyProfile().subscribe({
      next: (user) => {
        this.accountEmail = user.email ?? '';
        this.form.patchValue({
          fullNameAr: user.fullNameAr ?? '',
          fullNameEn: user.fullNameEn ?? '',
          phone: user.phone ?? '',
          profileImage: user.profileImage ?? user.profileImageUrl ?? ''
        });
        this.loading = false;
      },
      error: () => {
        const user = this.auth.getCurrentUser();
        this.accountEmail = user?.email ?? '';
        this.form.patchValue({
          fullNameAr: user?.fullNameAr ?? '',
          fullNameEn: user?.fullNameEn ?? '',
          phone: user?.phone ?? '',
          profileImage: user?.profileImage ?? user?.profileImageUrl ?? ''
        });
        this.loading = false;
      }
    });
  }
}
