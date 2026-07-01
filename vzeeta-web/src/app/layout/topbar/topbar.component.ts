import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription, timer } from 'rxjs';
import { I18nService, LanguageOption } from '../../core/i18n/i18n.service';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { NavigationHistoryService } from '../../core/services/navigation-history.service';
import {
  hasNotificationsInbox,
  notificationsInboxRoute,
  profileRouteForRole
} from '../../core/utils/notification-navigation.util';
import { NabdLogoComponent } from '../../shared/components/nabd-logo/nabd-logo.component';
import { SoundToggleComponent } from '../../shared/components/sound-toggle/sound-toggle.component';
import { BackgroundMusicService } from '../../core/services/background-music.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, RouterLink, TranslateModule, MatMenuModule, MatDividerModule, MatTooltipModule, NabdLogoComponent, SoundToggleComponent],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss'
})
export class TopbarComponent implements OnInit, OnDestroy {
  @Input() sidebarCollapsed = false;
  @Output() sidebarToggle = new EventEmitter<void>();
  searchQuery = '';
  unreadCount = 0;
  private pollSub?: Subscription;
  private unreadSyncSub?: Subscription;

  constructor(
    readonly i18n: I18nService,
    readonly theme: ThemeService,
    readonly auth: AuthService,
    private readonly notificationService: NotificationService,
    private readonly router: Router,
    private readonly navHistory: NavigationHistoryService,
    private readonly _music: BackgroundMusicService
  ) {}

  ngOnInit(): void {
    if (!this.showNotifications) return;
    this.pollSub = timer(0, 30000).subscribe(() => this.loadUnreadCount());
    this.unreadSyncSub = this.notificationService.unreadCount$.subscribe((count) => {
      if (count == null) return;
      this.unreadCount = count;
    });
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
    this.unreadSyncSub?.unsubscribe();
  }

  get currentUser() { return this.auth.getCurrentUser(); }

  get currentUserDisplayName(): string {
    const u = this.currentUser;
    if (!u) return '';
    const ar = (u.fullNameAr ?? '').trim();
    const en = (u.fullNameEn ?? '').trim();
    const fallback = (u.fullName ?? '').trim();
    return this.i18n.currentLang === 'ar'
      ? (ar || en || fallback || u.email || '')
      : (en || ar || fallback || u.email || '');
  }

  get roleKey(): string {
    const role = this.auth.getRole();
    return role ? `ROLES.${role}` : '';
  }

  get languages(): LanguageOption[] { return this.i18n.languages; }

  get activeLanguage(): LanguageOption {
    return this.languages.find((lang) => lang.code === this.i18n.currentLang) ?? this.languages[0];
  }

  get showNotifications(): boolean {
    return hasNotificationsInbox(this.auth);
  }

  get dashboardRoute(): string {
    return this.auth.getDashboardRoute();
  }

  get themeTooltipKey(): string {
    return this.theme.isDark ? 'TOPBAR.LIGHT_MODE' : 'TOPBAR.DARK_MODE';
  }

  languageLabel(lang: LanguageOption): string {
    return lang.label;
  }

  languageNativeLabel(lang: LanguageOption): string {
    return lang.nativeLabel;
  }

  profileRoute(): string {
    return profileRouteForRole(this.auth);
  }

  switchLang(lang: LanguageOption): void {
    this.i18n.setLang(lang.code).subscribe();
  }

  toggleTheme(): void {
    this.theme.toggle();
  }

  openNotificationsInbox(): void {
    void this.router.navigateByUrl(notificationsInboxRoute(this.auth));
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

  private loadUnreadCount(): void {
    this.notificationService.refreshUnreadCount();
  }
}
