import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { TranslateModule } from '@ngx-translate/core';
import { I18nService, LanguageOption } from '../../core/i18n/i18n.service';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';
import { PatientService } from '../../core/services/patient.service';
import { NavigationHistoryService } from '../../core/services/navigation-history.service';
import { withPageParams } from '../../core/utils/pagination.util';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, RouterLink, TranslateModule, MatMenuModule, MatTooltipModule, MatBadgeModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss'
})
export class TopbarComponent implements OnInit {
  @Input() sidebarCollapsed = false;
  @Output() sidebarToggle = new EventEmitter<void>();
  searchQuery = '';
  unreadCount = 0;

  constructor(
    readonly i18n: I18nService,
    readonly theme: ThemeService,
    readonly auth: AuthService,
    private readonly patientService: PatientService,
    private readonly router: Router,
    private readonly navHistory: NavigationHistoryService
  ) {}

  ngOnInit(): void {
    if (this.auth.getRole() === 'PATIENT') {
      this.patientService.getNotifications(withPageParams(0, 100)).subscribe({
        next: (page) => {
          this.unreadCount = page.content.filter((item) => !item.readFlag).length;
        },
        error: () => {
          this.unreadCount = 0;
        }
      });
    }
  }

  get currentUser() { return this.auth.getCurrentUser(); }

  get currentUserDisplayName(): string {
    const u = this.currentUser;
    if (!u) return '';
    return this.i18n.currentLang === 'ar'
      ? (u.fullNameAr || u.fullNameEn || u.fullName || u.email || '')
      : (u.fullNameEn || u.fullNameAr || u.fullName || u.email || '');
  }

  get languages(): LanguageOption[] { return this.i18n.languages; }

  get activeLanguage(): LanguageOption {
    return this.languages.find((lang) => lang.code === this.i18n.currentLang) ?? this.languages[0];
  }

  get dashboardRoute(): string {
    return this.auth.getDashboardRoute();
  }

  get profileRoute(): string {
    switch (this.auth.getRole()) {
      case 'SUPER_ADMIN': return '/super-admin/profile';
      case 'CLINIC_ADMIN': return '/clinic-admin/dashboard';
      case 'DOCTOR': return '/doctor/dashboard';
      case 'PATIENT': return '/patient/dashboard';
      default: return '/auth/login';
    }
  }

  get notificationsRoute(): string {
    switch (this.auth.getRole()) {
      case 'PATIENT': return '/patient/notifications';
      case 'DOCTOR': return '/doctor/appointments';
      case 'CLINIC_ADMIN': return '/clinic-admin/appointments';
      case 'SUPER_ADMIN': return '/super-admin/dashboard';
      default: return '/';
    }
  }

  get themeTooltipKey(): string {
    return this.theme.isDark ? 'TOPBAR.LIGHT_MODE' : 'TOPBAR.DARK_MODE';
  }

  switchLang(lang: LanguageOption): void {
    this.i18n.setLang(lang.code).subscribe();
  }

  toggleTheme(): void {
    this.theme.toggle();
  }

  onMenuNav(): void {
    this.navHistory.markFromMenu();
  }

  onSearch(): void {
    const q = this.searchQuery.trim();
    if (!q) return;
    switch (this.auth.getRole()) {
      case 'CLINIC_ADMIN':
        void this.router.navigate(['/clinic-admin/patients'], { queryParams: { q } });
        break;
      case 'SUPER_ADMIN':
        void this.router.navigate(['/super-admin/users'], { queryParams: { q } });
        break;
      case 'PATIENT':
      default:
        void this.router.navigate(['/doctors'], { queryParams: { q } });
        break;
    }
  }

  logout(): void {
    this.auth.logout();
  }
}
