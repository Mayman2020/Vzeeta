import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Location, NgIf } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { IdentityMediaFieldsComponent } from '../../../shared/components/identity-media-fields/identity-media-fields.component';
import { AuthService } from '../../../core/services/auth.service';
import { UserProfileService } from '../../../core/services/user-profile.service';
import { SnackService } from '../../../core/services/snack.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { NavigationHistoryService } from '../../../core/services/navigation-history.service';

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
    PageHeaderComponent,
    IdentityMediaFieldsComponent
  ],
  templateUrl: './account-profile.component.html'
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
    private readonly route: ActivatedRoute,
    private readonly location: Location,
    private readonly navHistory: NavigationHistoryService
  ) {
    this.form = this.fb.group({
      fullNameAr: ['', [Validators.required, Validators.maxLength(150)]],
      fullNameEn: ['', [Validators.maxLength(150)]],
      phone: ['', [Validators.maxLength(20)]],
      bio: ['', [Validators.maxLength(500)]],
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

  goBack(): void {
    if (this.navHistory.canGoBack()) {
      this.navHistory.goBack(this.location);
      return;
    }
    this.location.back();
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

  onProfileImageUrlChange(url: string): void {
    this.form.patchValue({ profileImage: url || '' });
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
          bio: (user as { bio?: string }).bio ?? '',
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
          bio: '',
          profileImage: user?.profileImage ?? user?.profileImageUrl ?? ''
        });
        this.loading = false;
      }
    });
  }
}
