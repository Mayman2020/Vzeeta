import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { PermissionService } from '../../core/services/permission.service';
import { NavigationHistoryService } from '../../core/services/navigation-history.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { UserRole } from '../../core/models/user.model';

interface NavItem {
  icon: string;
  labelKey: string;
  route: string;
  roles: UserRole[];
  permissionKey: string;
  tone: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink, RouterLinkActive, MatTooltipModule, TranslateModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Output() collapseToggle = new EventEmitter<void>();

  constructor(
    private readonly auth: AuthService,
    private readonly permissionService: PermissionService,
    private readonly navHistory: NavigationHistoryService,
    private readonly i18n: I18nService
  ) {}

  get navItems(): NavItem[] {
    const role = this.auth.getRole();
    const all: NavItem[] = [
      { icon: 'dashboard', labelKey: 'NAV.DASHBOARD', route: '/patient/dashboard', roles: ['PATIENT'], permissionKey: 'dashboard', tone: 'purple' },
      { icon: 'event', labelKey: 'NAV.APPOINTMENTS', route: '/patient/appointments', roles: ['PATIENT'], permissionKey: 'appointments', tone: 'orange' },
      { icon: 'favorite', labelKey: 'NAV.FAVORITES', route: '/patient/favorites', roles: ['PATIENT'], permissionKey: 'favorites', tone: 'rose' },
      { icon: 'medication', labelKey: 'NAV.PRESCRIPTIONS', route: '/patient/prescriptions', roles: ['PATIENT'], permissionKey: 'prescriptions', tone: 'teal' },
      { icon: 'science', labelKey: 'NAV.LAB_RESULTS', route: '/patient/lab-results', roles: ['PATIENT'], permissionKey: 'lab_results', tone: 'cyan' },
      { icon: 'folder_shared', labelKey: 'NAV.MEDICAL_RECORDS', route: '/patient/medical-records', roles: ['PATIENT'], permissionKey: 'medical_records', tone: 'indigo' },
      { icon: 'notifications', labelKey: 'NAV.NOTIFICATIONS', route: '/patient/notifications', roles: ['PATIENT'], permissionKey: 'notifications', tone: 'gold' },

      { icon: 'dashboard', labelKey: 'NAV.DASHBOARD', route: '/doctor/dashboard', roles: ['DOCTOR'], permissionKey: 'dashboard', tone: 'purple' },
      { icon: 'calendar_month', labelKey: 'NAV.CALENDAR', route: '/doctor/calendar', roles: ['DOCTOR'], permissionKey: 'calendar', tone: 'cyan' },
      { icon: 'event', labelKey: 'NAV.APPOINTMENTS', route: '/doctor/appointments', roles: ['DOCTOR'], permissionKey: 'appointments', tone: 'orange' },
      { icon: 'medication', labelKey: 'NAV.PRESCRIPTIONS', route: '/doctor/prescriptions', roles: ['DOCTOR'], permissionKey: 'prescriptions', tone: 'green' },
      { icon: 'payments', labelKey: 'NAV.EARNINGS', route: '/doctor/earnings', roles: ['DOCTOR'], permissionKey: 'earnings', tone: 'gold' },

      { icon: 'dashboard', labelKey: 'NAV.DASHBOARD', route: '/clinic-admin/dashboard', roles: ['CLINIC_ADMIN'], permissionKey: 'dashboard', tone: 'purple' },
      { icon: 'medical_information', labelKey: 'NAV.DOCTORS', route: '/clinic-admin/doctors', roles: ['CLINIC_ADMIN'], permissionKey: 'doctors', tone: 'teal' },
      { icon: 'store', labelKey: 'NAV.BRANCHES', route: '/clinic-admin/branches', roles: ['CLINIC_ADMIN'], permissionKey: 'branches', tone: 'orange' },
      { icon: 'event', labelKey: 'NAV.APPOINTMENTS', route: '/clinic-admin/appointments', roles: ['CLINIC_ADMIN'], permissionKey: 'appointments', tone: 'cyan' },
      { icon: 'groups', labelKey: 'NAV.PATIENTS', route: '/clinic-admin/patients', roles: ['CLINIC_ADMIN'], permissionKey: 'patients', tone: 'rose' },
      { icon: 'medical_services', labelKey: 'NAV.SERVICES', route: '/clinic-admin/services', roles: ['CLINIC_ADMIN'], permissionKey: 'services', tone: 'green' },
      { icon: 'category', labelKey: 'NAV.SPECIALTIES', route: '/clinic-admin/specialties', roles: ['CLINIC_ADMIN'], permissionKey: 'specialties', tone: 'purple' },
      { icon: 'science', labelKey: 'NAV.LAB_RESULTS', route: '/clinic-admin/lab-results', roles: ['CLINIC_ADMIN'], permissionKey: 'lab_results', tone: 'cyan' },
      { icon: 'analytics', labelKey: 'NAV.ANALYTICS', route: '/clinic-admin/analytics', roles: ['CLINIC_ADMIN'], permissionKey: 'analytics', tone: 'indigo' },

      { icon: 'dashboard', labelKey: 'NAV.DASHBOARD', route: '/super-admin/dashboard', roles: ['SUPER_ADMIN'], permissionKey: 'dashboard', tone: 'purple' },
      { icon: 'local_hospital', labelKey: 'NAV.CLINICS', route: '/super-admin/clinics', roles: ['SUPER_ADMIN'], permissionKey: 'clinics', tone: 'teal' },
      { icon: 'people', labelKey: 'NAV.USERS', route: '/super-admin/users', roles: ['SUPER_ADMIN'], permissionKey: 'users', tone: 'orange' },
      { icon: 'verified', labelKey: 'NAV.VERIFICATION', route: '/super-admin/verification', roles: ['SUPER_ADMIN'], permissionKey: 'verification', tone: 'rose' },
      { icon: 'location_city', labelKey: 'NAV.CITIES', route: '/super-admin/cities', roles: ['SUPER_ADMIN'], permissionKey: 'settings', tone: 'cyan' },
      { icon: 'payment', labelKey: 'NAV.PAYMENTS', route: '/super-admin/payments', roles: ['SUPER_ADMIN'], permissionKey: 'payments', tone: 'gold' },
      { icon: 'settings', labelKey: 'NAV.SETTINGS', route: '/super-admin/settings', roles: ['SUPER_ADMIN'], permissionKey: 'settings', tone: 'slate' },
      { icon: 'admin_panel_settings', labelKey: 'NAV.PERMISSIONS', route: '/super-admin/permissions', roles: ['SUPER_ADMIN'], permissionKey: 'permissions', tone: 'indigo' },
      { icon: 'list_alt', labelKey: 'NAV.LOOKUPS', route: '/super-admin/lookups', roles: ['SUPER_ADMIN'], permissionKey: 'lookups', tone: 'green' },
      { icon: 'manage_accounts', labelKey: 'NAV.PROFILE', route: '/super-admin/profile', roles: ['SUPER_ADMIN'], permissionKey: 'profile', tone: 'slate' }
    ];
    if (!role) return [];
    return all.filter((item) => item.roles.includes(role) && this.permissionService.can(item.permissionKey, 'menu'));
  }

  get currentUser() { return this.auth.getCurrentUser(); }

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

  get collapseIcon(): string {
    const lang = this.i18n.currentLang;
    if (this.collapsed) {
      return lang === 'ar' ? 'chevron_left' : 'chevron_right';
    }
    return lang === 'ar' ? 'chevron_right' : 'chevron_left';
  }

  logout(): void {
    this.auth.logout();
  }

  onMenuNav(): void {
    this.navHistory.markFromMenu();
  }
}
