import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FeatureShellComponent } from '../../shared/components/feature-shell/feature-shell.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { TablePagerComponent } from '../../shared/components/table-pager/table-pager.component';
import { ListLoadController } from '../../shared/utils/list-load.util';
import { DEFAULT_TABLE_PAGE_SIZE, withPageParams } from '../../core/utils/pagination.util';
import { SuperAdminService, AdminClinic, AdminDoctor, AdminPayment, AdminUser, SystemSetting } from '../../core/services/super-admin.service';
import { SnackService } from '../../core/services/snack.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { RolePermissionDto, RolePermissionService } from '../../core/services/role-permission.service';
import { LookupItem, LookupService, LookupType } from '../../core/services/lookup.service';
import { AuthService } from '../../core/services/auth.service';
import { PermissionAction, PermissionMap, USER_ROLE_VALUES, UserRole } from '../../core/models/user.model';
import { RmsDatePipe } from '../../shared/pipes/rms-date.pipe';

@Component({
  selector: 'app-super-admin-dashboard',
  standalone: true,
  imports: [NgFor, NgIf, TranslateModule, LoadingSpinnerComponent, MatIconModule, MatButtonModule, RouterLink],
  template: `
    <div class="sa-dashboard" *ngIf="!loading; else loadingTpl">

      <!-- Welcome -->
      <div class="sa-welcome-bar">
        <div class="sa-welcome-left">
          <div class="sa-welcome-icon"><mat-icon>admin_panel_settings</mat-icon></div>
          <div>
            <h1 class="sa-welcome-title">{{ 'ADMIN.DASHBOARD_TITLE' | translate }}</h1>
            <p class="sa-welcome-sub">{{ 'ADMIN.WELCOME' | translate }}</p>
          </div>
        </div>
        <div class="sa-welcome-actions">
          <a mat-stroked-button routerLink="/super-admin/clinics" class="sa-action-btn">
            <mat-icon>add_business</mat-icon>
            {{ 'ADMIN.ADD_CLINIC' | translate }}
          </a>
          <a mat-flat-button routerLink="/super-admin/verification" class="sa-primary-btn">
            <mat-icon>verified</mat-icon>
            {{ 'NAV.VERIFICATION' | translate }}
          </a>
        </div>
      </div>

      <!-- KPI Grid -->
      <div class="sa-kpi-grid">
        <div class="sa-kpi-card">
          <div class="sa-kpi-icon-wrap indigo"><mat-icon>local_hospital</mat-icon></div>
          <div class="sa-kpi-body">
            <div class="sa-kpi-value">{{ clinicCount }}</div>
            <div class="sa-kpi-label">{{ 'ADMIN.TOTAL_CLINICS' | translate }}</div>
            <a routerLink="/super-admin/clinics" class="sa-kpi-link">
              {{ 'COMMON.VIEW_ALL' | translate }} <mat-icon>arrow_forward</mat-icon>
            </a>
          </div>
        </div>

        <div class="sa-kpi-card">
          <div class="sa-kpi-icon-wrap blue"><mat-icon>people</mat-icon></div>
          <div class="sa-kpi-body">
            <div class="sa-kpi-value">{{ userCount }}</div>
            <div class="sa-kpi-label">{{ 'ADMIN.TOTAL_USERS' | translate }}</div>
            <a routerLink="/super-admin/users" class="sa-kpi-link">
              {{ 'COMMON.VIEW_ALL' | translate }} <mat-icon>arrow_forward</mat-icon>
            </a>
          </div>
        </div>

        <div class="sa-kpi-card warn-card">
          <div class="sa-kpi-icon-wrap orange"><mat-icon>pending</mat-icon></div>
          <div class="sa-kpi-body">
            <div class="sa-kpi-value">{{ pendingCount }}</div>
            <div class="sa-kpi-label">{{ 'ADMIN.PENDING_VERIFICATION' | translate }}</div>
            <a routerLink="/super-admin/verification" class="sa-kpi-link warn-link">
              {{ 'ADMIN.REVIEW_NOW' | translate }} <mat-icon>arrow_forward</mat-icon>
            </a>
          </div>
        </div>

        <div class="sa-kpi-card">
          <div class="sa-kpi-icon-wrap teal"><mat-icon>payments</mat-icon></div>
          <div class="sa-kpi-body">
            <div class="sa-kpi-value">{{ paymentCount }}</div>
            <div class="sa-kpi-label">{{ 'ADMIN.TOTAL_PAYMENTS' | translate }}</div>
            <a routerLink="/super-admin/payments" class="sa-kpi-link">
              {{ 'COMMON.VIEW_ALL' | translate }} <mat-icon>arrow_forward</mat-icon>
            </a>
          </div>
        </div>
      </div>

      <!-- Quick Nav -->
      <div class="sa-quick-nav">
        <h2 class="sa-section-title">{{ 'ADMIN.MANAGEMENT' | translate }}</h2>
        <div class="sa-nav-grid">
          <a *ngFor="let nav of quickNav" [routerLink]="nav.route" class="sa-nav-card" [attr.data-tone]="nav.tone">
            <span class="sa-nav-icon"><mat-icon>{{ nav.icon }}</mat-icon></span>
            <span class="sa-nav-label">{{ nav.labelKey | translate }}</span>
            <mat-icon class="sa-nav-arrow">chevron_right</mat-icon>
          </a>
        </div>
      </div>
    </div>
    <ng-template #loadingTpl><app-loading-spinner></app-loading-spinner></ng-template>
  `,
  styles: [`
    .sa-dashboard { display: flex; flex-direction: column; gap: 24px; padding-bottom: 32px; }

    .sa-welcome-bar {
      display: flex; align-items: center; justify-content: space-between; gap: 16px;
      padding: 22px 28px;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      border-radius: 16px; color: #fff;
    }
    .sa-welcome-left { display: flex; align-items: center; gap: 14px; }
    .sa-welcome-icon {
      width: 50px; height: 50px; background: rgba(255,255,255,0.12);
      border-radius: 13px; display: grid; place-items: center;
      mat-icon { font-size: 26px; width: 26px; height: 26px; color: #93c5fd; }
    }
    .sa-welcome-title { margin: 0 0 3px; font-size: 1.3rem; font-weight: 800; color: #fff; }
    .sa-welcome-sub { margin: 0; color: rgba(255,255,255,0.6); font-size: 0.85rem; }
    .sa-welcome-actions { display: flex; gap: 10px; }
    .sa-action-btn {
      border-color: rgba(255,255,255,0.25) !important; color: #fff !important;
      border-radius: 10px !important;
    }
    .sa-primary-btn {
      background: #2563eb !important; color: #fff !important;
      border-radius: 10px !important;
    }

    .sa-kpi-grid {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
    }
    .sa-kpi-card {
      background: #fff; border: 1px solid #e2e8f0; border-radius: 14px;
      padding: 20px; display: flex; align-items: flex-start; gap: 14px;
      box-shadow: 0 2px 12px rgba(15,23,42,0.05);
      transition: transform 0.18s, box-shadow 0.18s;
    }
    .sa-kpi-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(15,23,42,0.1); }
    .sa-kpi-card.warn-card { border-color: #fed7aa; background: #fffbf5; }
    .sa-kpi-icon-wrap {
      width: 46px; height: 46px; border-radius: 12px;
      display: grid; place-items: center; flex-shrink: 0;
      mat-icon { font-size: 22px; width: 22px; height: 22px; }
    }
    .sa-kpi-icon-wrap.indigo { background: #e0e7ff; mat-icon { color: #4f46e5; } }
    .sa-kpi-icon-wrap.blue { background: #dbeafe; mat-icon { color: #2563eb; } }
    .sa-kpi-icon-wrap.orange { background: #ffedd5; mat-icon { color: #ea580c; } }
    .sa-kpi-icon-wrap.teal { background: #d1fae5; mat-icon { color: #059669; } }
    .sa-kpi-body { flex: 1; }
    .sa-kpi-value { font-size: 2.1rem; font-weight: 800; color: #0f172a; line-height: 1.1; }
    .sa-kpi-label { font-size: 0.8rem; color: #64748b; margin: 4px 0 10px; }
    .sa-kpi-link {
      display: inline-flex; align-items: center; gap: 2px;
      color: #2563eb; font-size: 0.78rem; font-weight: 600; text-decoration: none;
      mat-icon { font-size: 14px; width: 14px; height: 14px; }
    }
    .sa-kpi-link:hover { text-decoration: underline; }
    .warn-link { color: #ea580c !important; }

    .sa-section-title { margin: 0 0 14px; font-size: 1rem; font-weight: 800; color: #0f172a; }
    .sa-nav-grid {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
    }
    .sa-nav-card {
      display: flex; align-items: center; gap: 12px;
      padding: 16px; border: 1px solid #e2e8f0; border-radius: 12px;
      background: #fff; text-decoration: none; color: #0f172a;
      transition: border-color 0.15s, background 0.15s, transform 0.15s;
    }
    .sa-nav-card:hover {
      border-color: #bfdbfe; background: #eff6ff;
      transform: translateY(-1px);
    }
    .sa-nav-icon {
      width: 40px; height: 40px; border-radius: 10px;
      background: #f1f5f9; display: grid; place-items: center;
      mat-icon { font-size: 20px; width: 20px; height: 20px; color: #475569; }
    }
    .sa-nav-label { flex: 1; font-size: 0.88rem; font-weight: 600; }
    .sa-nav-arrow { font-size: 18px !important; width: 18px !important; height: 18px !important; color: #94a3b8; }

    @media (max-width: 900px) { .sa-kpi-grid { grid-template-columns: repeat(2,1fr); } .sa-nav-grid { grid-template-columns: repeat(2,1fr); } }
    @media (max-width: 560px) { .sa-kpi-grid { grid-template-columns: 1fr 1fr; } .sa-welcome-bar { flex-direction: column; align-items: flex-start; } }
  `]
})
export class SuperAdminDashboardComponent implements OnInit {
  loading = true;
  clinicCount = 0;
  userCount = 0;
  pendingCount = 0;
  paymentCount = 0;

  readonly quickNav = [
    { route: '/super-admin/clinics', icon: 'local_hospital', labelKey: 'NAV.CLINICS', tone: 'indigo' },
    { route: '/super-admin/users', icon: 'people', labelKey: 'NAV.USERS', tone: 'blue' },
    { route: '/super-admin/verification', icon: 'verified', labelKey: 'NAV.VERIFICATION', tone: 'orange' },
    { route: '/super-admin/payments', icon: 'payments', labelKey: 'NAV.PAYMENTS', tone: 'teal' },
    { route: '/super-admin/cities', icon: 'location_city', labelKey: 'NAV.CITIES', tone: 'slate' },
    { route: '/super-admin/permissions', icon: 'security', labelKey: 'NAV.PERMISSIONS', tone: 'purple' },
    { route: '/super-admin/lookups', icon: 'list_alt', labelKey: 'NAV.LOOKUPS', tone: 'green' },
    { route: '/super-admin/settings', icon: 'settings', labelKey: 'NAV.SETTINGS', tone: 'slate' },
  ];

  constructor(private readonly admin: SuperAdminService) {}

  ngOnInit(): void {
    this.admin.getDashboard().subscribe({
      next: (d) => {
        this.clinicCount = d.clinicCount;
        this.userCount = d.userCount;
        this.pendingCount = d.unverifiedDoctorCount;
        this.paymentCount = d.paymentCount;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }
}

@Component({
  selector: 'app-super-admin-clinics',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, ReactiveFormsModule, TranslateModule, MatChipsModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatCheckboxModule, MatCardModule, PageHeaderComponent, EmptyStateComponent, TablePagerComponent, MatProgressSpinnerModule],
  template: `
    <div class="app-page">
      <app-page-header titleKey="NAV.CLINICS">
        <button mat-flat-button color="primary" type="button" (click)="openCreate()">
          <mat-icon>add</mat-icon> {{ 'ADMIN.ADD_CLINIC' | translate }}
        </button>
      </app-page-header>
      <div *ngIf="listLoad.showInitialSpinner" class="loading-wrap"><mat-spinner diameter="40"></mat-spinner></div>
      <app-empty-state *ngIf="listLoad.showSurface && rows.length === 0 && !hasActiveFilters()" icon="local_hospital" titleKey="COMMON.NO_DATA"></app-empty-state>
      <div class="app-list-surface" [class.is-refreshing]="listLoad.refreshing" *ngIf="listLoad.showSurface && (rows.length > 0 || hasActiveFilters())">
        <div class="list-refresh-spinner" *ngIf="listLoad.refreshing"><mat-spinner diameter="32"></mat-spinner></div>
        <section class="list-stats"><article class="stat-pill"><span class="stat-label">{{ 'COMMON.ALL' | translate }}</span><strong>{{ totalElements }}</strong></article></section>
        <section class="app-card table-card">
          <div class="estate-table-toolbar">
            <label class="estate-search-inline"><span class="material-icons">search</span>
              <input [(ngModel)]="searchTerm" (ngModelChange)="onSearch()" [placeholder]="'NAV.CLINICS' | translate">
            </label>
          </div>
          <div class="app-table-wrap"><table class="app-data-table"><thead><tr>
            <th>{{ 'NAV.CLINICS' | translate }}</th><th>{{ 'AUTH.EMAIL' | translate }}</th><th>{{ 'COMMON.STATUS' | translate }}</th><th>{{ 'COMMON.ACTIONS' | translate }}</th>
          </tr></thead><tbody>
            <tr *ngFor="let c of rows">
              <td>{{ c.nameAr }}</td><td>{{ c.email }} · {{ c.phone }}</td>
              <td><mat-chip [color]="c.verified ? 'primary' : 'warn'">{{ c.verified ? ('ADMIN.VERIFIED' | translate) : ('ADMIN.PENDING' | translate) }}</mat-chip></td>
              <td><button mat-stroked-button type="button" (click)="openEdit(c)">{{ 'COMMON.EDIT' | translate }}</button></td>
            </tr>
          </tbody></table></div>
          <app-table-pager [length]="totalElements" [pageSize]="pageSize" [pageIndex]="pageIndex" (pageIndexChange)="onPageChange($event)"/>
        </section>
      </div>
      <div class="dialog-backdrop" *ngIf="showDialog" (click)="closeDialog()">
        <mat-card class="dialog-panel" (click)="$event.stopPropagation()">
          <h3>{{ (editingId ? 'ADMIN.EDIT_CLINIC' : 'ADMIN.ADD_CLINIC') | translate }}</h3>
          <form [formGroup]="clinicForm" (ngSubmit)="saveClinic()" class="dialog-form">
            <mat-form-field appearance="outline"><mat-label>{{ 'LOOKUPS.NAME_AR' | translate }}</mat-label><input matInput formControlName="nameAr"></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>{{ 'LOOKUPS.NAME_EN' | translate }}</mat-label><input matInput formControlName="nameEn"></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>{{ 'AUTH.EMAIL' | translate }}</mat-label><input matInput formControlName="email"></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>{{ 'AUTH.PHONE' | translate }}</mat-label><input matInput formControlName="phone"></mat-form-field>
            <mat-checkbox formControlName="active">{{ 'ADMIN.ACTIVE' | translate }}</mat-checkbox>
            <mat-checkbox formControlName="verified">{{ 'ADMIN.VERIFIED' | translate }}</mat-checkbox>
            <div class="dialog-actions">
              <button mat-button type="button" (click)="closeDialog()">{{ 'COMMON.CANCEL' | translate }}</button>
              <button mat-flat-button color="primary" type="submit" [disabled]="clinicForm.invalid || saving">{{ 'COMMON.SAVE' | translate }}</button>
            </div>
          </form>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dialog-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 1rem; }
    .dialog-panel { padding: 1.5rem; min-width: 320px; max-width: 480px; width: 100%; }
    .dialog-form { display: flex; flex-direction: column; gap: 0.5rem; }
    .dialog-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.5rem; }
  `]
})
export class SuperAdminClinicsComponent implements OnInit {
  listLoad = new ListLoadController();
  rows: AdminClinic[] = [];
  pageIndex = 0;
  pageSize = DEFAULT_TABLE_PAGE_SIZE;
  totalElements = 0;
  searchTerm = '';
  showDialog = false;
  editingId: number | null = null;
  saving = false;
  clinicForm: FormGroup;
  private searchTimer?: ReturnType<typeof setTimeout>;
  constructor(
    fb: FormBuilder,
    private readonly admin: SuperAdminService,
    private readonly snack: SnackService,
    private readonly i18n: I18nService
  ) {
    this.clinicForm = fb.group({
      nameAr: ['', Validators.required],
      nameEn: [''],
      email: [''],
      phone: [''],
      active: [true],
      verified: [false]
    });
  }
  ngOnInit(): void { this.load(); }
  load(): void {
    this.listLoad.begin();
    this.admin.getClinics(withPageParams(this.pageIndex, this.pageSize, { q: this.searchTerm })).subscribe({
      next: (res) => { this.rows = res.content; this.totalElements = res.totalElements; this.listLoad.end(); },
      error: () => { this.rows = []; this.totalElements = 0; this.listLoad.end(); }
    });
  }
  openCreate(): void { this.editingId = null; this.clinicForm.reset({ nameAr: '', nameEn: '', email: '', phone: '', active: true, verified: false }); this.showDialog = true; }
  openEdit(c: AdminClinic): void {
    this.editingId = c.id;
    this.clinicForm.patchValue({ nameAr: c.nameAr, nameEn: c.nameEn ?? '', email: c.email ?? '', phone: c.phone ?? '', active: c.active, verified: c.verified });
    this.showDialog = true;
  }
  closeDialog(): void { this.showDialog = false; this.editingId = null; }
  saveClinic(): void {
    if (this.clinicForm.invalid || this.saving) return;
    this.saving = true;
    const payload = { ...this.clinicForm.getRawValue(), ...(this.editingId ? { id: this.editingId } : {}) };
    this.admin.saveClinic(payload).subscribe({
      next: () => {
        this.snack.success(this.i18n.instant('ADMIN.CLINIC_SAVED'));
        this.saving = false;
        this.closeDialog();
        this.load();
      },
      error: () => { this.saving = false; }
    });
  }
  onPageChange(i: number): void { this.pageIndex = i; this.load(); }
  onSearch(): void { clearTimeout(this.searchTimer); this.searchTimer = setTimeout(() => { this.pageIndex = 0; this.load(); }, 300); }
  hasActiveFilters(): boolean { return !!this.searchTerm?.trim(); }
}

@Component({
  selector: 'app-super-admin-users',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, ReactiveFormsModule, TranslateModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatCheckboxModule, MatCardModule, PageHeaderComponent, EmptyStateComponent, TablePagerComponent, MatProgressSpinnerModule],
  template: `
    <div class="app-page">
      <app-page-header titleKey="NAV.USERS"></app-page-header>
      <div *ngIf="listLoad.showInitialSpinner" class="loading-wrap"><mat-spinner diameter="40"></mat-spinner></div>
      <app-empty-state *ngIf="listLoad.showSurface && rows.length === 0 && !hasActiveFilters()" icon="people" titleKey="COMMON.NO_DATA"></app-empty-state>
      <div class="app-list-surface" [class.is-refreshing]="listLoad.refreshing" *ngIf="listLoad.showSurface && (rows.length > 0 || hasActiveFilters())">
        <div class="list-refresh-spinner" *ngIf="listLoad.refreshing"><mat-spinner diameter="32"></mat-spinner></div>
        <section class="list-stats">
          <article class="stat-pill stat-pill--purple"><span class="stat-label">{{ 'COMMON.ALL' | translate }}</span><strong>{{ totalElements }}</strong></article>
        </section>
        <section class="app-card table-card">
          <div class="estate-table-toolbar">
            <label class="estate-search-inline"><span class="material-icons">search</span>
              <input [(ngModel)]="searchTerm" (ngModelChange)="onSearch()" [placeholder]="'NAV.USERS' | translate">
            </label>
          </div>
          <div class="app-table-wrap"><table class="app-data-table"><thead><tr>
            <th>{{ 'NAV.USERS' | translate }}</th><th>{{ 'AUTH.EMAIL' | translate }}</th><th>{{ 'AUTH.ROLE' | translate }}</th><th>{{ 'COMMON.STATUS' | translate }}</th><th>{{ 'COMMON.ACTIONS' | translate }}</th>
          </tr></thead><tbody>
            <tr *ngFor="let u of rows">
              <td>{{ u.fullNameAr || u.fullNameEn || u.email }}</td><td>{{ u.email }}</td>
              <td>{{ ('ROLES.' + u.role) | translate }}</td>
              <td><span class="status-badge" [attr.data-status]="u.active ? 'ACTIVE' : 'INACTIVE'">{{ u.active ? ('ADMIN.ACTIVE' | translate) : ('ADMIN.INACTIVE' | translate) }}</span></td>
              <td class="action-cell">
                <button mat-stroked-button type="button" (click)="toggleActive(u)">{{ 'ADMIN.TOGGLE_ACTIVE' | translate }}</button>
                <button mat-button type="button" (click)="openEdit(u)">{{ 'COMMON.EDIT' | translate }}</button>
              </td>
            </tr>
          </tbody></table></div>
          <app-table-pager [length]="totalElements" [pageSize]="pageSize" [pageIndex]="pageIndex" (pageIndexChange)="onPageChange($event)"/>
        </section>
      </div>
      <div class="dialog-backdrop" *ngIf="showDialog" (click)="closeDialog()">
        <mat-card class="dialog-panel" (click)="$event.stopPropagation()">
          <h3>{{ 'ADMIN.EDIT_USER' | translate }}</h3>
          <form [formGroup]="userForm" (ngSubmit)="saveUser()" class="dialog-form">
            <mat-form-field appearance="outline"><mat-label>{{ 'LOOKUPS.NAME_AR' | translate }}</mat-label><input matInput formControlName="fullNameAr"></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>{{ 'LOOKUPS.NAME_EN' | translate }}</mat-label><input matInput formControlName="fullNameEn"></mat-form-field>
            <mat-checkbox formControlName="active">{{ 'ADMIN.ACTIVE' | translate }}</mat-checkbox>
            <div class="dialog-actions">
              <button mat-button type="button" (click)="closeDialog()">{{ 'COMMON.CANCEL' | translate }}</button>
              <button mat-flat-button color="primary" type="submit" [disabled]="userForm.invalid || saving">{{ 'COMMON.SAVE' | translate }}</button>
            </div>
          </form>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .action-cell { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .dialog-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 1rem; }
    .dialog-panel { padding: 1.5rem; min-width: 320px; max-width: 480px; width: 100%; }
    .dialog-form { display: flex; flex-direction: column; gap: 0.5rem; }
    .dialog-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.5rem; }
  `]
})
export class SuperAdminUsersComponent implements OnInit {
  listLoad = new ListLoadController();
  rows: AdminUser[] = [];
  pageIndex = 0;
  pageSize = DEFAULT_TABLE_PAGE_SIZE;
  totalElements = 0;
  searchTerm = '';
  showDialog = false;
  editingUser: AdminUser | null = null;
  saving = false;
  userForm: FormGroup;
  private searchTimer?: ReturnType<typeof setTimeout>;
  constructor(
    fb: FormBuilder,
    private readonly admin: SuperAdminService,
    private readonly snack: SnackService,
    private readonly i18n: I18nService
  ) {
    this.userForm = fb.group({ fullNameAr: ['', Validators.required], fullNameEn: [''], active: [true] });
  }
  ngOnInit(): void { this.load(); }
  load(): void {
    this.listLoad.begin();
    this.admin.getUsers(withPageParams(this.pageIndex, this.pageSize, { q: this.searchTerm })).subscribe({
      next: (res) => { this.rows = res.content; this.totalElements = res.totalElements; this.listLoad.end(); },
      error: () => { this.rows = []; this.totalElements = 0; this.listLoad.end(); }
    });
  }
  toggleActive(u: AdminUser): void {
    this.admin.updateUser(u.id, { active: !u.active, fullNameAr: u.fullNameAr }).subscribe({
      next: () => { this.snack.success(this.i18n.instant('ADMIN.USER_UPDATED')); this.load(); }
    });
  }
  openEdit(u: AdminUser): void {
    this.editingUser = u;
    this.userForm.patchValue({ fullNameAr: u.fullNameAr, fullNameEn: u.fullNameEn ?? '', active: u.active });
    this.showDialog = true;
  }
  closeDialog(): void { this.showDialog = false; this.editingUser = null; }
  saveUser(): void {
    if (!this.editingUser || this.userForm.invalid || this.saving) return;
    this.saving = true;
    this.admin.updateUser(this.editingUser.id, this.userForm.getRawValue()).subscribe({
      next: () => {
        this.snack.success(this.i18n.instant('ADMIN.USER_UPDATED'));
        this.saving = false;
        this.closeDialog();
        this.load();
      },
      error: () => { this.saving = false; }
    });
  }
  onPageChange(i: number): void { this.pageIndex = i; this.load(); }
  onSearch(): void { clearTimeout(this.searchTimer); this.searchTimer = setTimeout(() => { this.pageIndex = 0; this.load(); }, 300); }
  hasActiveFilters(): boolean { return !!this.searchTerm?.trim(); }
}

@Component({
  selector: 'app-super-admin-verification',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, TranslateModule, MatButtonModule, PageHeaderComponent, EmptyStateComponent, TablePagerComponent, MatProgressSpinnerModule],
  template: `
    <div class="app-page">
      <app-page-header titleKey="NAV.VERIFICATION"></app-page-header>
      <div *ngIf="listLoad.showInitialSpinner" class="loading-wrap"><mat-spinner diameter="40"></mat-spinner></div>
      <app-empty-state *ngIf="listLoad.showSurface && rows.length === 0 && !hasActiveFilters()" icon="verified" titleKey="ADMIN.NO_PENDING"></app-empty-state>
      <div class="app-list-surface" [class.is-refreshing]="listLoad.refreshing" *ngIf="listLoad.showSurface && (rows.length > 0 || hasActiveFilters())">
        <div class="list-refresh-spinner" *ngIf="listLoad.refreshing"><mat-spinner diameter="32"></mat-spinner></div>
        <section class="list-stats"><article class="stat-pill"><span class="stat-label">{{ 'COMMON.ALL' | translate }}</span><strong>{{ totalElements }}</strong></article></section>
        <section class="app-card table-card">
          <div class="estate-table-toolbar">
            <label class="estate-search-inline"><span class="material-icons">search</span>
              <input [(ngModel)]="searchTerm" (ngModelChange)="onSearch()" [placeholder]="'NAV.VERIFICATION' | translate">
            </label>
          </div>
          <div class="app-table-wrap"><table class="app-data-table"><thead><tr>
            <th>{{ 'DOCTOR.DOCTOR' | translate }}</th><th>{{ 'COMMON.EGP' | translate }}</th><th>{{ 'COMMON.ACTIONS' | translate }}</th>
          </tr></thead><tbody>
            <tr *ngFor="let d of rows">
              <td>{{ d.titleAr || ('DOCTOR.DOCTOR' | translate) }} #{{ d.id }}</td>
              <td>{{ d.consultationFee }}</td>
              <td><button mat-flat-button color="primary" (click)="verify(d)">{{ 'ADMIN.VERIFY' | translate }}</button></td>
            </tr>
          </tbody></table></div>
          <app-table-pager [length]="totalElements" [pageSize]="pageSize" [pageIndex]="pageIndex" (pageIndexChange)="onPageChange($event)"/>
        </section>
      </div>
    </div>
  `
})
export class SuperAdminVerificationComponent implements OnInit {
  listLoad = new ListLoadController();
  rows: AdminDoctor[] = [];
  pageIndex = 0;
  pageSize = DEFAULT_TABLE_PAGE_SIZE;
  totalElements = 0;
  searchTerm = '';
  private searchTimer?: ReturnType<typeof setTimeout>;
  constructor(
    private readonly admin: SuperAdminService,
    private readonly snack: SnackService,
    private readonly i18n: I18nService
  ) {}
  ngOnInit(): void { this.load(); }
  load(): void {
    this.listLoad.begin();
    this.admin.getDoctors(false, withPageParams(this.pageIndex, this.pageSize, { q: this.searchTerm })).subscribe({
      next: (res) => { this.rows = res.content; this.totalElements = res.totalElements; this.listLoad.end(); },
      error: () => { this.rows = []; this.totalElements = 0; this.listLoad.end(); }
    });
  }
  onPageChange(i: number): void { this.pageIndex = i; this.load(); }
  onSearch(): void { clearTimeout(this.searchTimer); this.searchTimer = setTimeout(() => { this.pageIndex = 0; this.load(); }, 300); }
  hasActiveFilters(): boolean { return !!this.searchTerm?.trim(); }
  verify(d: AdminDoctor): void {
    this.admin.verifyDoctor(d.id, true).subscribe({
      next: () => { this.snack.success(this.i18n.instant('ADMIN.VERIFIED_SUCCESS')); this.load(); }
    });
  }
}

@Component({
  selector: 'app-super-admin-cities',
  standalone: true,
  imports: [NgFor, NgIf, ReactiveFormsModule, RouterLink, TranslateModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatProgressSpinnerModule, PageHeaderComponent, EmptyStateComponent],
  template: `
    <div class="app-page">
      <app-page-header titleKey="NAV.CITIES" subtitleKey="ADMIN.CITIES_LOOKUP_HINT">
        <a mat-stroked-button routerLink="/super-admin/lookups">{{ 'ADMIN.LOOKUPS_LINK' | translate }}</a>
      </app-page-header>
      <mat-card class="form-card">
        <form [formGroup]="form" (ngSubmit)="submit()">
          <mat-form-field appearance="outline">
            <mat-label>{{ 'ADMIN.CITY_NAME_AR' | translate }}</mat-label>
            <input matInput formControlName="nameAr">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>{{ 'ADMIN.CITY_NAME_EN' | translate }}</mat-label>
            <input matInput formControlName="nameEn">
          </mat-form-field>
          <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">{{ 'COMMON.SAVE' | translate }}</button>
        </form>
      </mat-card>
      <div *ngIf="loading" class="loading-wrap"><mat-spinner diameter="36"></mat-spinner></div>
      <section class="app-card table-card" *ngIf="!loading">
        <h3>{{ 'ADMIN.CITIES_LIST' | translate }}</h3>
        <app-empty-state *ngIf="cities.length === 0" icon="location_city" titleKey="COMMON.NO_DATA"></app-empty-state>
        <div class="app-table-wrap" *ngIf="cities.length > 0">
          <table class="app-data-table">
            <thead><tr><th>{{ 'LOOKUPS.NAME_AR' | translate }}</th><th>{{ 'LOOKUPS.NAME_EN' | translate }}</th></tr></thead>
            <tbody><tr *ngFor="let c of cities"><td>{{ c.nameAr }}</td><td>{{ c.nameEn || '-' }}</td></tr></tbody>
          </table>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .form-card { padding:1.5rem; margin-bottom: 1rem; }
    form { display:flex; flex-direction:column; gap:0.5rem; max-width: 480px; }
    .table-card { padding: 1rem; }
    h3 { margin: 0 0 1rem; }
  `]
})
export class SuperAdminCitiesComponent implements OnInit {
  form: FormGroup;
  cities: { id: number; nameAr: string; nameEn?: string }[] = [];
  loading = true;
  constructor(
    fb: FormBuilder,
    private readonly admin: SuperAdminService,
    private readonly snack: SnackService,
    private readonly i18n: I18nService
  ) {
    this.form = fb.group({ nameAr: ['', Validators.required], nameEn: [''] });
  }
  ngOnInit(): void { this.loadCities(); }
  loadCities(): void {
    this.loading = true;
    this.admin.getCities().subscribe({
      next: (items) => { this.cities = items; this.loading = false; },
      error: () => { this.cities = []; this.loading = false; }
    });
  }
  submit(): void {
    if (this.form.invalid) return;
    this.admin.saveCity(this.form.value).subscribe({
      next: () => {
        this.snack.success(this.i18n.instant('ADMIN.CITY_SAVED'));
        this.form.reset();
        this.loadCities();
      }
    });
  }
}

@Component({
  selector: 'app-super-admin-payments',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, RmsDatePipe, TranslateModule, MatChipsModule, MatFormFieldModule, MatSelectModule, PageHeaderComponent, EmptyStateComponent, TablePagerComponent, MatProgressSpinnerModule],
  template: `
    <div class="app-page">
      <app-page-header titleKey="NAV.PAYMENTS"></app-page-header>
      <div *ngIf="listLoad.showInitialSpinner" class="loading-wrap"><mat-spinner diameter="40"></mat-spinner></div>
      <app-empty-state *ngIf="listLoad.showSurface && rows.length === 0 && !hasActiveFilters()" icon="payment" titleKey="COMMON.NO_DATA"></app-empty-state>
      <div class="app-list-surface" [class.is-refreshing]="listLoad.refreshing" *ngIf="listLoad.showSurface && (rows.length > 0 || hasActiveFilters())">
        <div class="list-refresh-spinner" *ngIf="listLoad.refreshing"><mat-spinner diameter="32"></mat-spinner></div>
        <section class="list-stats"><article class="stat-pill"><span class="stat-label">{{ 'COMMON.ALL' | translate }}</span><strong>{{ totalElements }}</strong></article></section>
        <section class="app-card table-card">
          <div class="estate-table-toolbar">
            <label class="estate-search-inline"><span class="material-icons">search</span>
              <input [(ngModel)]="searchTerm" (ngModelChange)="onSearch()" [placeholder]="'NAV.PAYMENTS' | translate">
            </label>
            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>{{ 'COMMON.FILTER_STATUS' | translate }}</mat-label>
              <mat-select [(ngModel)]="statusFilter" (selectionChange)="onStatusChange()">
                <mat-option value="">{{ 'COMMON.ALL' | translate }}</mat-option>
                <mat-option *ngFor="let s of paymentStatuses" [value]="s">{{ 'PAYMENT_STATUS.' + s | translate }}</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
          <div class="app-table-wrap"><table class="app-data-table"><thead><tr>
            <th>{{ 'COMMON.EGP' | translate }}</th><th>{{ 'ADMIN.APPOINTMENT' | translate }}</th><th>{{ 'COMMON.STATUS' | translate }}</th><th>{{ 'COMMON.ALL' | translate }}</th>
          </tr></thead><tbody>
            <tr *ngFor="let p of rows">
              <td>{{ p.amount }}</td><td>#{{ p.appointmentId }}</td><td><mat-chip>{{ 'PAYMENT_STATUS.' + p.status | translate }}</mat-chip></td>
              <td>{{ p.createdAt | rmsDate:'datetime' }}</td>
            </tr>
          </tbody></table></div>
          <app-table-pager [length]="totalElements" [pageSize]="pageSize" [pageIndex]="pageIndex" (pageIndexChange)="onPageChange($event)"/>
        </section>
      </div>
    </div>
  `,
  styles: [`.filter-field { min-width: 160px; }`]
})
export class SuperAdminPaymentsComponent implements OnInit {
  listLoad = new ListLoadController();
  rows: AdminPayment[] = [];
  pageIndex = 0;
  pageSize = DEFAULT_TABLE_PAGE_SIZE;
  totalElements = 0;
  searchTerm = '';
  statusFilter = '';
  readonly paymentStatuses = ['PAID', 'PENDING', 'FAILED'] as const;
  private searchTimer?: ReturnType<typeof setTimeout>;
  constructor(private readonly admin: SuperAdminService) {}
  ngOnInit(): void { this.load(); }
  load(): void {
    this.listLoad.begin();
    const params = withPageParams(this.pageIndex, this.pageSize, { q: this.searchTerm });
    if (this.statusFilter) params['status'] = this.statusFilter;
    this.admin.getPayments(params).subscribe({
      next: (res) => { this.rows = res.content; this.totalElements = res.totalElements; this.listLoad.end(); },
      error: () => { this.rows = []; this.totalElements = 0; this.listLoad.end(); }
    });
  }
  onPageChange(i: number): void { this.pageIndex = i; this.load(); }
  onSearch(): void { clearTimeout(this.searchTimer); this.searchTimer = setTimeout(() => { this.pageIndex = 0; this.load(); }, 300); }
  onStatusChange(): void { this.pageIndex = 0; this.load(); }
  hasActiveFilters(): boolean { return !!this.searchTerm?.trim() || !!this.statusFilter; }
}

@Component({
  selector: 'app-super-admin-settings',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, TranslateModule, MatButtonModule, MatFormFieldModule, MatInputModule, PageHeaderComponent, EmptyStateComponent, TablePagerComponent, MatProgressSpinnerModule],
  template: `
    <div class="app-page">
      <app-page-header titleKey="NAV.SETTINGS"></app-page-header>
      <div *ngIf="listLoad.showInitialSpinner" class="loading-wrap"><mat-spinner diameter="40"></mat-spinner></div>
      <app-empty-state *ngIf="listLoad.showSurface && rows.length === 0 && !hasActiveFilters()" icon="settings" titleKey="COMMON.NO_DATA"></app-empty-state>
      <div class="app-list-surface" [class.is-refreshing]="listLoad.refreshing" *ngIf="listLoad.showSurface && (rows.length > 0 || hasActiveFilters())">
        <div class="list-refresh-spinner" *ngIf="listLoad.refreshing"><mat-spinner diameter="32"></mat-spinner></div>
        <section class="list-stats"><article class="stat-pill"><span class="stat-label">{{ 'COMMON.ALL' | translate }}</span><strong>{{ totalElements }}</strong></article></section>
        <section class="app-card table-card">
          <div class="estate-table-toolbar">
            <label class="estate-search-inline"><span class="material-icons">search</span>
              <input [(ngModel)]="searchTerm" (ngModelChange)="onSearch()" [placeholder]="'NAV.SETTINGS' | translate">
            </label>
          </div>
          <div class="app-table-wrap"><table class="app-data-table"><thead><tr>
            <th>{{ 'NAV.SETTINGS' | translate }}</th><th>{{ 'COMMON.ALL' | translate }}</th><th>{{ 'COMMON.ACTIONS' | translate }}</th>
          </tr></thead><tbody>
            <tr *ngFor="let s of rows">
              <td><strong>{{ s.settingKey }}</strong><br><span class="muted">{{ s.description }}</span></td>
              <td>
                <mat-form-field appearance="outline" *ngIf="editKey === s.settingKey">
                  <input matInput [(ngModel)]="editValue">
                </mat-form-field>
                <span *ngIf="editKey !== s.settingKey">{{ s.settingValue }}</span>
              </td>
              <td>
                <button mat-stroked-button *ngIf="editKey !== s.settingKey" (click)="startEdit(s)">{{ 'COMMON.UPDATE' | translate }}</button>
                <button mat-flat-button color="primary" *ngIf="editKey === s.settingKey" (click)="saveEdit(s)">{{ 'COMMON.SAVE' | translate }}</button>
                <button mat-button *ngIf="editKey === s.settingKey" (click)="cancelEdit()">{{ 'COMMON.CANCEL' | translate }}</button>
              </td>
            </tr>
          </tbody></table></div>
          <app-table-pager [length]="totalElements" [pageSize]="pageSize" [pageIndex]="pageIndex" (pageIndexChange)="onPageChange($event)"/>
        </section>
      </div>
    </div>
  `,
  styles: [`.muted { color: var(--tb-text-muted); font-size: 0.85rem; }`]
})
export class SuperAdminSettingsComponent implements OnInit {
  listLoad = new ListLoadController();
  rows: SystemSetting[] = [];
  pageIndex = 0;
  pageSize = DEFAULT_TABLE_PAGE_SIZE;
  totalElements = 0;
  searchTerm = '';
  editKey = '';
  editValue = '';
  private searchTimer?: ReturnType<typeof setTimeout>;
  constructor(
    private readonly admin: SuperAdminService,
    private readonly snack: SnackService,
    private readonly i18n: I18nService
  ) {}
  ngOnInit(): void { this.load(); }
  load(): void {
    this.listLoad.begin();
    this.admin.getSettings(withPageParams(this.pageIndex, this.pageSize, { q: this.searchTerm })).subscribe({
      next: (res) => { this.rows = res.content; this.totalElements = res.totalElements; this.listLoad.end(); },
      error: () => { this.rows = []; this.totalElements = 0; this.listLoad.end(); }
    });
  }
  onPageChange(i: number): void { this.pageIndex = i; this.load(); }
  onSearch(): void { clearTimeout(this.searchTimer); this.searchTimer = setTimeout(() => { this.pageIndex = 0; this.load(); }, 300); }
  hasActiveFilters(): boolean { return !!this.searchTerm?.trim(); }
  startEdit(s: SystemSetting): void { this.editKey = s.settingKey; this.editValue = s.settingValue; }
  cancelEdit(): void { this.editKey = ''; this.editValue = ''; }
  saveEdit(s: SystemSetting): void {
    this.admin.updateSetting(s.settingKey, this.editValue).subscribe({
      next: () => {
        this.snack.success(this.i18n.instant('COMMON.SAVE'));
        this.cancelEdit();
        this.load();
      }
    });
  }
}

const PERMISSION_ACTIONS: PermissionAction[] = ['enabled', 'menu', 'view', 'create', 'edit', 'delete', 'export', 'approve'];

@Component({
  selector: 'app-super-admin-permissions',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    FormsModule,
    TranslateModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    PageHeaderComponent
  ],
  template: `
    <app-page-header titleKey="PERMISSIONS.TITLE" subtitleKey="PERMISSIONS.SUBTITLE"></app-page-header>
    <div class="page-shell">
      <div class="app-card table-card">
        <div class="permissions-toolbar">
          <mat-form-field appearance="outline">
            <mat-label>{{ 'PERMISSIONS.SELECT_ROLE' | translate }}</mat-label>
            <mat-select [(ngModel)]="selectedRole" (selectionChange)="onRoleChange()">
              <mat-option *ngFor="let role of roles" [value]="role">{{ ('ROLES.' + role) | translate }}</mat-option>
            </mat-select>
          </mat-form-field>
          <button mat-flat-button color="primary" type="button" (click)="save()" [disabled]="saving || loading">
            {{ 'COMMON.SAVE' | translate }}
          </button>
        </div>

        <div class="loading-wrap" *ngIf="loading">
          <mat-spinner diameter="36"></mat-spinner>
        </div>

        <div class="perm-grid" *ngIf="!loading">
          <div class="perm-header">
            <span>{{ 'PERMISSIONS.MODULE' | translate }}</span>
            <span *ngFor="let action of actions">{{ ('PERMISSIONS.' + action.toUpperCase()) | translate }}</span>
          </div>
          <div class="perm-row" *ngFor="let module of modules">
            <span class="module-name">{{ module }}</span>
            <mat-checkbox
              *ngFor="let action of actions"
              [checked]="isChecked(module, action)"
              (change)="toggle(module, action, $event.checked)">
            </mat-checkbox>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .permissions-toolbar {
      display: flex;
      align-items: center;
      gap: 1rem;
      justify-content: space-between;
      margin-bottom: 1rem;
    }
    .perm-grid { display: grid; gap: 0.5rem; }
    .perm-header, .perm-row {
      display: grid;
      grid-template-columns: 180px repeat(8, minmax(56px, 1fr));
      align-items: center;
      gap: 0.25rem;
    }
    .perm-header { font-weight: 600; color: var(--tb-text-muted); }
    .module-name { font-weight: 600; }
  `]
})
export class SuperAdminPermissionsComponent implements OnInit {
  loading = true;
  saving = false;
  roles = USER_ROLE_VALUES;
  selectedRole: UserRole = 'CLINIC_ADMIN';
  allRoles: RolePermissionDto[] = [];
  permissions: PermissionMap = {};
  modules: string[] = [];
  readonly actions = PERMISSION_ACTIONS;

  constructor(
    private readonly rolePermissionService: RolePermissionService,
    private readonly snack: SnackService
  ) {}

  ngOnInit(): void {
    this.rolePermissionService.getAll().subscribe({
      next: (res) => {
        this.allRoles = res.data ?? [];
        if (!this.roles.includes(this.selectedRole)) {
          this.selectedRole = this.roles[0] ?? 'SUPER_ADMIN';
        }
        this.applyRole(this.selectedRole);
        this.loading = false;
      },
      error: (err: Error) => {
        this.snack.error(err.message);
        this.loading = false;
      }
    });
  }

  onRoleChange(): void {
    this.applyRole(this.selectedRole);
  }

  isChecked(module: string, action: PermissionAction): boolean {
    return this.permissions[module]?.[action] === true;
  }

  toggle(module: string, action: PermissionAction, checked: boolean): void {
    if (!this.permissions[module]) {
      this.permissions[module] = {
        enabled: false,
        menu: false,
        view: false,
        create: false,
        edit: false,
        delete: false,
        export: false,
        approve: false
      };
    }
    this.permissions[module][action] = checked;
  }

  save(): void {
    this.saving = true;
    this.rolePermissionService.update(this.selectedRole, this.permissions).subscribe({
      next: (res) => {
        const idx = this.allRoles.findIndex((x) => x.role === this.selectedRole);
        if (idx >= 0 && res.data) this.allRoles[idx] = res.data;
        this.snack.success('Saved');
        this.saving = false;
      },
      error: (err: Error) => {
        this.snack.error(err.message);
        this.saving = false;
      }
    });
  }

  private applyRole(role: UserRole): void {
    const found = this.allRoles.find((item) => item.role === role);
    this.permissions = { ...(found?.permissions ?? {}) };
    this.modules = Object.keys(this.permissions);
  }
}

interface LookupTab {
  type: LookupType;
  labelKey: string;
}

@Component({
  selector: 'app-super-admin-lookups',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    ReactiveFormsModule,
    TranslateModule,
    MatTabsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    PageHeaderComponent,
    EmptyStateComponent
  ],
  template: `
    <app-page-header titleKey="LOOKUPS.TITLE" subtitleKey="LOOKUPS.SUBTITLE"></app-page-header>
    <mat-card class="lookup-card">
      <mat-tab-group (selectedIndexChange)="onTabChange($event)">
        <mat-tab *ngFor="let tab of tabs" [label]="tab.labelKey | translate">
          <div class="lookup-body">
            <div class="loading-wrap" *ngIf="loading[tab.type]"><mat-spinner diameter="32"></mat-spinner></div>

            <form [formGroup]="form" (ngSubmit)="save(tab.type)" class="lookup-form">
              <mat-form-field appearance="outline">
                <mat-label>{{ 'LOOKUPS.CODE' | translate }}</mat-label>
                <input matInput formControlName="code">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>{{ 'LOOKUPS.NAME_AR' | translate }}</mat-label>
                <input matInput formControlName="nameAr">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>{{ 'LOOKUPS.NAME_EN' | translate }}</mat-label>
                <input matInput formControlName="nameEn">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>{{ 'LOOKUPS.SORT_ORDER' | translate }}</mat-label>
                <input matInput type="number" formControlName="sortOrder">
              </mat-form-field>
              <div class="lookup-form-actions">
                <button mat-stroked-button type="button" (click)="resetForm()">{{ 'COMMON.CANCEL' | translate }}</button>
                <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">
                  {{ editId ? ('COMMON.UPDATE' | translate) : ('COMMON.SAVE' | translate) }}
                </button>
              </div>
            </form>

            <table class="app-data-table" *ngIf="!loading[tab.type] && (items[tab.type]?.length ?? 0) > 0">
              <thead>
                <tr>
                  <th>{{ 'LOOKUPS.CODE' | translate }}</th>
                  <th>{{ 'LOOKUPS.NAME_AR' | translate }}</th>
                  <th>{{ 'LOOKUPS.NAME_EN' | translate }}</th>
                  <th>{{ 'LOOKUPS.SORT_ORDER' | translate }}</th>
                  <th>{{ 'COMMON.STATUS' | translate }}</th>
                  <th>{{ 'COMMON.ACTIONS' | translate }}</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of items[tab.type] ?? []">
                  <td>{{ item.code }}</td>
                  <td>{{ item.nameAr }}</td>
                  <td>{{ item.nameEn }}</td>
                  <td>{{ item.sortOrder }}</td>
                  <td>{{ item.active ? ('LOOKUPS.ACTIVE' | translate) : ('LOOKUPS.INACTIVE' | translate) }}</td>
                  <td class="action-cell">
                    <button mat-icon-button type="button" (click)="edit(item)">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button type="button" (click)="remove(item, tab.type)" [disabled]="item.locked">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
            <app-empty-state *ngIf="!loading[tab.type] && !(items[tab.type]?.length)" icon="list_alt" titleKey="COMMON.NO_DATA"></app-empty-state>
          </div>
        </mat-tab>
      </mat-tab-group>
    </mat-card>
  `,
  styles: [`
    .lookup-card { padding: 0; overflow: hidden; }
    .lookup-body { padding: 1rem; }
    .lookup-form {
      display: grid;
      grid-template-columns: repeat(4, minmax(150px, 1fr));
      gap: 0.5rem;
      align-items: end;
      margin-bottom: 1rem;
    }
    .lookup-form-actions {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
    }
    .action-cell { white-space: nowrap; }
  `]
})
export class SuperAdminLookupsComponent implements OnInit {
  readonly tabs: LookupTab[] = [
    { type: 'CLINIC_TYPE', labelKey: 'LOOKUPS.TAB_CLINIC_TYPE' },
    { type: 'PAYMENT_METHOD', labelKey: 'LOOKUPS.TAB_PAYMENT_METHOD' },
    { type: 'APPOINTMENT_STATUS', labelKey: 'LOOKUPS.TAB_APPOINTMENT_STATUS' }
  ];
  readonly items: Record<LookupType, LookupItem[]> = {
    CLINIC_TYPE: [],
    PAYMENT_METHOD: [],
    APPOINTMENT_STATUS: []
  };
  readonly loading: Record<LookupType, boolean> = {
    CLINIC_TYPE: false,
    PAYMENT_METHOD: false,
    APPOINTMENT_STATUS: false
  };
  form: FormGroup;
  activeType: LookupType = 'CLINIC_TYPE';
  editId: number | null = null;

  constructor(
    fb: FormBuilder,
    private readonly lookupService: LookupService,
    private readonly snack: SnackService
  ) {
    this.form = fb.group({
      code: ['', Validators.required],
      nameAr: ['', Validators.required],
      nameEn: ['', Validators.required],
      sortOrder: [0, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadAll();
  }

  onTabChange(index: number): void {
    this.activeType = this.tabs[index]?.type ?? this.activeType;
    this.resetForm();
  }

  edit(item: LookupItem): void {
    this.editId = item.id;
    this.form.patchValue({
      code: item.code,
      nameAr: item.nameAr,
      nameEn: item.nameEn,
      sortOrder: item.sortOrder
    });
  }

  resetForm(): void {
    this.editId = null;
    this.form.reset({ code: '', nameAr: '', nameEn: '', sortOrder: 0 });
  }

  save(type: LookupType): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    if (this.editId) {
      this.lookupService.update(this.editId, {
        code: value.code,
        nameAr: value.nameAr,
        nameEn: value.nameEn,
        sortOrder: Number(value.sortOrder ?? 0),
        active: true
      }).subscribe({
        next: () => {
          this.snack.success('Saved');
          this.resetForm();
          this.loadType(type);
        },
        error: (err: Error) => this.snack.error(err.message)
      });
      return;
    }
    this.lookupService.create({
      type,
      code: value.code,
      nameAr: value.nameAr,
      nameEn: value.nameEn,
      sortOrder: Number(value.sortOrder ?? 0)
    }).subscribe({
      next: () => {
        this.snack.success('Saved');
        this.resetForm();
        this.loadType(type);
      },
      error: (err: Error) => this.snack.error(err.message)
    });
  }

  remove(item: LookupItem, type: LookupType): void {
    this.lookupService.delete(item.id).subscribe({
      next: () => {
        this.snack.success('Deleted');
        this.loadType(type);
      },
      error: (err: Error) => this.snack.error(err.message)
    });
  }

  private loadAll(): void {
    this.tabs.forEach((tab) => this.loadType(tab.type));
  }

  private loadType(type: LookupType): void {
    this.loading[type] = true;
    this.lookupService.getAllByType(type).subscribe({
      next: (res) => {
        this.items[type] = res.data ?? [];
        this.loading[type] = false;
      },
      error: (err: Error) => {
        this.snack.error(err.message);
        this.loading[type] = false;
      }
    });
  }
}

@Component({
  selector: 'app-super-admin-profile',
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    TranslateModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    PageHeaderComponent
  ],
  template: `
    <app-page-header titleKey="NAV.PROFILE" subtitleKey="PROFILE.CHANGE_PASSWORD_SUBTITLE"></app-page-header>
    <mat-card class="form-card" [class.highlight]="highlightPassword">
      <form [formGroup]="form" (ngSubmit)="changePassword()">
        <mat-form-field appearance="outline">
          <mat-label>{{ 'PROFILE.CURRENT_PASSWORD' | translate }}</mat-label>
          <input matInput type="password" formControlName="currentPassword">
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>{{ 'PROFILE.NEW_PASSWORD' | translate }}</mat-label>
          <input matInput type="password" formControlName="newPassword">
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>{{ 'PROFILE.CONFIRM_PASSWORD' | translate }}</mat-label>
          <input matInput type="password" formControlName="confirmPassword">
        </mat-form-field>
        <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || changingPassword">
          {{ 'PROFILE.CHANGE_PASSWORD' | translate }}
        </button>
      </form>
      <div class="loading-wrap" *ngIf="changingPassword"><mat-spinner diameter="32"></mat-spinner></div>
    </mat-card>
  `,
  styles: [`
    .form-card { padding: 1.5rem; position: relative; }
    .form-card.highlight { border: 1px solid var(--warn, #d97706); }
    form {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-width: 520px;
    }
  `]
})
export class SuperAdminProfileComponent implements OnInit {
  changingPassword = false;
  highlightPassword = false;
  form: FormGroup;

  constructor(
    fb: FormBuilder,
    private readonly auth: AuthService,
    private readonly route: ActivatedRoute,
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
    this.highlightPassword = this.route.snapshot.queryParamMap.get('changePassword') === '1';
  }

  changePassword(): void {
    if (this.form.invalid || this.changingPassword) return;
    const value = this.form.getRawValue();
    if (value.newPassword !== value.confirmPassword) {
      this.snack.error(this.i18n.instant('PROFILE.PASSWORD_MISMATCH'));
      return;
    }
    this.changingPassword = true;
    this.auth.changePassword({ currentPassword: value.currentPassword, newPassword: value.newPassword }).subscribe({
      next: () => {
        this.auth.clearMustChangePassword();
        this.highlightPassword = false;
        this.form.reset();
        this.snack.success(this.i18n.instant('PROFILE.PASSWORD_CHANGED'));
        this.changingPassword = false;
      },
      error: (err: Error) => {
        this.snack.error(err.message);
        this.changingPassword = false;
      }
    });
  }
}
