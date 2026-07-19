import { Component, DoCheck, EventEmitter, Input, Output } from '@angular/core';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { PermissionService } from '../../core/services/permission.service';
import { NavigationHistoryService } from '../../core/services/navigation-history.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { UserRole } from '../../core/models/user.model';
import { NabdLogoComponent } from '../../shared/components/nabd-logo/nabd-logo.component';

interface NavItem {
  icon: string;
  labelKey: string;
  route: string;
  roles: UserRole[];
  permissionKey: string;
  tone: string;
  sectionKey: NavSectionKey;
}

type NavSectionKey =
  | 'NAV_SECTION.OVERVIEW'
  | 'NAV_SECTION.CLINIC'
  | 'NAV_SECTION.CARE'
  | 'NAV_SECTION.MANAGEMENT'
  | 'NAV_SECTION.FINANCE'
  | 'NAV_SECTION.ACCOUNT';

interface NavSection {
  key: NavSectionKey;
  items: NavItem[];
}

const NAV_ITEMS: NavItem[] = [
  { icon: 'dashboard', labelKey: 'NAV.DASHBOARD', route: '/patient/dashboard', roles: ['PATIENT'], permissionKey: 'dashboard', tone: 'purple', sectionKey: 'NAV_SECTION.OVERVIEW' },
  { icon: 'event', labelKey: 'NAV.APPOINTMENTS', route: '/patient/appointments', roles: ['PATIENT'], permissionKey: 'appointments', tone: 'orange', sectionKey: 'NAV_SECTION.CARE' },
  { icon: 'favorite', labelKey: 'NAV.FAVORITES', route: '/patient/favorites', roles: ['PATIENT'], permissionKey: 'favorites', tone: 'rose', sectionKey: 'NAV_SECTION.CARE' },
  { icon: 'medication', labelKey: 'NAV.PRESCRIPTIONS', route: '/patient/prescriptions', roles: ['PATIENT'], permissionKey: 'prescriptions', tone: 'teal', sectionKey: 'NAV_SECTION.CARE' },
  { icon: 'science', labelKey: 'NAV.LAB_RESULTS', route: '/patient/lab-results', roles: ['PATIENT'], permissionKey: 'lab_results', tone: 'cyan', sectionKey: 'NAV_SECTION.CARE' },
  { icon: 'folder_shared', labelKey: 'NAV.MEDICAL_RECORDS', route: '/patient/medical-records', roles: ['PATIENT'], permissionKey: 'medical_records', tone: 'indigo', sectionKey: 'NAV_SECTION.CARE' },
  { icon: 'notifications', labelKey: 'NAV.NOTIFICATIONS', route: '/patient/notifications', roles: ['PATIENT'], permissionKey: 'notifications', tone: 'gold', sectionKey: 'NAV_SECTION.ACCOUNT' },
  { icon: 'manage_accounts', labelKey: 'NAV.PROFILE', route: '/patient/profile', roles: ['PATIENT'], permissionKey: 'profile', tone: 'slate', sectionKey: 'NAV_SECTION.ACCOUNT' },

  { icon: 'dashboard', labelKey: 'NAV.DASHBOARD', route: '/doctor/dashboard', roles: ['DOCTOR'], permissionKey: 'dashboard', tone: 'purple', sectionKey: 'NAV_SECTION.OVERVIEW' },
  { icon: 'calendar_month', labelKey: 'NAV.CALENDAR', route: '/doctor/calendar', roles: ['DOCTOR'], permissionKey: 'calendar', tone: 'cyan', sectionKey: 'NAV_SECTION.CARE' },
  { icon: 'event', labelKey: 'NAV.APPOINTMENTS', route: '/doctor/appointments', roles: ['DOCTOR'], permissionKey: 'appointments', tone: 'orange', sectionKey: 'NAV_SECTION.CARE' },
  { icon: 'medication', labelKey: 'NAV.PRESCRIPTIONS', route: '/doctor/prescriptions', roles: ['DOCTOR'], permissionKey: 'prescriptions', tone: 'green', sectionKey: 'NAV_SECTION.CARE' },
  { icon: 'folder_shared', labelKey: 'NAV.MEDICAL_RECORDS', route: '/doctor/medical-records', roles: ['DOCTOR'], permissionKey: 'medical_records', tone: 'indigo', sectionKey: 'NAV_SECTION.CARE' },
  { icon: 'payments', labelKey: 'NAV.EARNINGS', route: '/doctor/earnings', roles: ['DOCTOR'], permissionKey: 'earnings', tone: 'gold', sectionKey: 'NAV_SECTION.FINANCE' },
  { icon: 'manage_accounts', labelKey: 'NAV.PROFILE', route: '/doctor/profile', roles: ['DOCTOR'], permissionKey: 'profile', tone: 'slate', sectionKey: 'NAV_SECTION.ACCOUNT' },

  { icon: 'dashboard', labelKey: 'NAV.DASHBOARD', route: '/clinic-admin/dashboard', roles: ['CLINIC_ADMIN'], permissionKey: 'dashboard', tone: 'purple', sectionKey: 'NAV_SECTION.OVERVIEW' },
  { icon: 'medical_information', labelKey: 'NAV.DOCTORS', route: '/clinic-admin/doctors', roles: ['CLINIC_ADMIN'], permissionKey: 'doctors', tone: 'teal', sectionKey: 'NAV_SECTION.CLINIC' },
  { icon: 'store', labelKey: 'NAV.BRANCHES', route: '/clinic-admin/branches', roles: ['CLINIC_ADMIN'], permissionKey: 'branches', tone: 'orange', sectionKey: 'NAV_SECTION.CLINIC' },
  { icon: 'event', labelKey: 'NAV.APPOINTMENTS', route: '/clinic-admin/appointments', roles: ['CLINIC_ADMIN'], permissionKey: 'appointments', tone: 'cyan', sectionKey: 'NAV_SECTION.CARE' },
  { icon: 'groups', labelKey: 'NAV.PATIENTS', route: '/clinic-admin/patients', roles: ['CLINIC_ADMIN'], permissionKey: 'patients', tone: 'rose', sectionKey: 'NAV_SECTION.CARE' },
  { icon: 'medical_services', labelKey: 'NAV.SERVICES', route: '/clinic-admin/services', roles: ['CLINIC_ADMIN'], permissionKey: 'services', tone: 'green', sectionKey: 'NAV_SECTION.CLINIC' },
  { icon: 'category', labelKey: 'NAV.SPECIALTIES', route: '/clinic-admin/specialties', roles: ['CLINIC_ADMIN'], permissionKey: 'specialties', tone: 'purple', sectionKey: 'NAV_SECTION.MANAGEMENT' },
  { icon: 'science', labelKey: 'NAV.LAB_RESULTS', route: '/clinic-admin/lab-results', roles: ['CLINIC_ADMIN'], permissionKey: 'lab_results', tone: 'cyan', sectionKey: 'NAV_SECTION.CARE' },
  { icon: 'analytics', labelKey: 'NAV.ANALYTICS', route: '/clinic-admin/analytics', roles: ['CLINIC_ADMIN'], permissionKey: 'analytics', tone: 'indigo', sectionKey: 'NAV_SECTION.MANAGEMENT' },
  { icon: 'workspace_premium', labelKey: 'NAV.MY_SUBSCRIPTION', route: '/clinic-admin/subscription', roles: ['CLINIC_ADMIN'], permissionKey: 'subscriptions', tone: 'gold', sectionKey: 'NAV_SECTION.FINANCE' },
  { icon: 'manage_accounts', labelKey: 'NAV.PROFILE', route: '/clinic-admin/profile', roles: ['CLINIC_ADMIN'], permissionKey: 'profile', tone: 'slate', sectionKey: 'NAV_SECTION.ACCOUNT' },

  { icon: 'dashboard', labelKey: 'NAV.DASHBOARD', route: '/super-admin/dashboard', roles: ['SUPER_ADMIN'], permissionKey: 'dashboard', tone: 'purple', sectionKey: 'NAV_SECTION.OVERVIEW' },
  { icon: 'local_hospital', labelKey: 'NAV.CLINICS', route: '/super-admin/clinics', roles: ['SUPER_ADMIN'], permissionKey: 'clinics', tone: 'teal', sectionKey: 'NAV_SECTION.MANAGEMENT' },
  { icon: 'people', labelKey: 'NAV.USERS', route: '/super-admin/users', roles: ['SUPER_ADMIN'], permissionKey: 'users', tone: 'orange', sectionKey: 'NAV_SECTION.MANAGEMENT' },
  { icon: 'verified', labelKey: 'NAV.VERIFICATION', route: '/super-admin/verification', roles: ['SUPER_ADMIN'], permissionKey: 'verification', tone: 'rose', sectionKey: 'NAV_SECTION.MANAGEMENT' },
  { icon: 'payment', labelKey: 'NAV.PAYMENTS', route: '/super-admin/payments', roles: ['SUPER_ADMIN'], permissionKey: 'payments', tone: 'gold', sectionKey: 'NAV_SECTION.FINANCE' },
  { icon: 'card_membership', labelKey: 'NAV.SUBSCRIPTION_PLANS', route: '/super-admin/subscription-plans', roles: ['SUPER_ADMIN'], permissionKey: 'subscriptions', tone: 'teal', sectionKey: 'NAV_SECTION.FINANCE' },
  { icon: 'workspace_premium', labelKey: 'NAV.CLINIC_SUBSCRIPTIONS', route: '/super-admin/clinic-subscriptions', roles: ['SUPER_ADMIN'], permissionKey: 'subscriptions', tone: 'gold', sectionKey: 'NAV_SECTION.FINANCE' },
  { icon: 'settings', labelKey: 'NAV.SETTINGS', route: '/super-admin/settings', roles: ['SUPER_ADMIN'], permissionKey: 'settings', tone: 'slate', sectionKey: 'NAV_SECTION.ACCOUNT' },
  { icon: 'admin_panel_settings', labelKey: 'NAV.PERMISSIONS', route: '/super-admin/permissions', roles: ['SUPER_ADMIN'], permissionKey: 'permissions', tone: 'indigo', sectionKey: 'NAV_SECTION.ACCOUNT' },
  { icon: 'list_alt', labelKey: 'NAV.LOOKUPS', route: '/super-admin/lookups', roles: ['SUPER_ADMIN'], permissionKey: 'lookups', tone: 'green', sectionKey: 'NAV_SECTION.MANAGEMENT' },
  { icon: 'manage_accounts', labelKey: 'NAV.PROFILE', route: '/super-admin/profile', roles: ['SUPER_ADMIN'], permissionKey: 'profile', tone: 'slate', sectionKey: 'NAV_SECTION.ACCOUNT' }
];

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [NgClass, NgFor, NgIf, RouterLink, RouterLinkActive, MatTooltipModule, TranslateModule, NabdLogoComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements DoCheck {
  @Input() collapsed = false;
  @Input() lang: 'ar' | 'en' = 'ar';
  @Output() collapseToggle = new EventEmitter<void>();
  navItems: NavItem[] = [];
  private navCacheKey = '';
  readonly sectionExpanded: Record<NavSectionKey, boolean> = {
    'NAV_SECTION.OVERVIEW': true,
    'NAV_SECTION.CLINIC': true,
    'NAV_SECTION.CARE': true,
    'NAV_SECTION.MANAGEMENT': true,
    'NAV_SECTION.FINANCE': true,
    'NAV_SECTION.ACCOUNT': true
  };
  private readonly sectionOrder: NavSectionKey[] = [
    'NAV_SECTION.OVERVIEW',
    'NAV_SECTION.CLINIC',
    'NAV_SECTION.CARE',
    'NAV_SECTION.MANAGEMENT',
    'NAV_SECTION.FINANCE',
    'NAV_SECTION.ACCOUNT'
  ];

  constructor(
    private readonly auth: AuthService,
    private readonly permissionService: PermissionService,
    private readonly navHistory: NavigationHistoryService,
    private readonly i18n: I18nService,
    private readonly router: Router
  ) {}

  ngDoCheck(): void {
    this.refreshNavItemsIfNeeded();
  }

  trackByRoute(_index: number, item: NavItem): string {
    return item.route;
  }

  trackBySection(_index: number, section: NavSection): string {
    return section.key;
  }

  get visibleSections(): NavSection[] {
    return this.sectionOrder
      .map((key) => ({ key, items: this.navItems.filter((item) => item.sectionKey === key) }))
      .filter((section) => section.items.length > 0);
  }

  toggleSection(sectionKey: NavSectionKey): void {
    this.sectionExpanded[sectionKey] = !this.sectionExpanded[sectionKey];
  }

  isForcedActive(item: NavItem): boolean {
    const url = this.router.url.split('?')[0];
    return url === item.route || url.startsWith(`${item.route}/`);
  }

  private refreshNavItemsIfNeeded(): void {
    const role = this.auth.getRole();
    const permissions = this.permissionService.getPermissions();
    const cacheKey = `${role ?? ''}:${Object.keys(permissions).length}`;
    if (cacheKey === this.navCacheKey) return;
    this.navCacheKey = cacheKey;
    this.navItems = role
      ? NAV_ITEMS.filter((item) => item.roles.includes(role) && this.permissionService.can(item.permissionKey, 'menu'))
      : [];
  }

  get currentUser() { return this.auth.getCurrentUser(); }

  get profileImageUrl(): string | null {
    const u = this.currentUser;
    const url = (u?.profileImageUrl || u?.profileImage || '').trim();
    return url || null;
  }

  get currentUserDisplayName(): string {
    const u = this.currentUser;
    if (!u) return '';
    const ar = (u.fullNameAr ?? '').trim();
    const en = (u.fullNameEn ?? '').trim();
    return this.i18n.currentLang === 'ar' ? (ar || en || u.fullName || u.email || '') : (en || ar || u.fullName || u.email || '');
  }

  get roleKey(): string {
    const r = this.auth.getRole();
    return r ? `ROLES.${r}` : '';
  }

  logout(): void {
    this.auth.logout();
  }

  onMenuNav(): void {
    this.navHistory.markFromMenu();
  }
}
