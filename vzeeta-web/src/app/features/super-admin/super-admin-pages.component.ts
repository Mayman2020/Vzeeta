import { Component, OnInit } from '@angular/core';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
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
import { AuthService } from '../../core/services/auth.service';
import { PermissionAction, PermissionMap, USER_ROLE_VALUES, UserRole } from '../../core/models/user.model';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { ClinicDialogComponent } from './clinic-dialog.component';
import { AdminUserDialogComponent } from './admin-user-dialog.component';
import { RmsDatePipe } from '../../shared/pipes/rms-date.pipe';

@Component({
  selector: 'app-super-admin-dashboard',
  standalone: true,
  imports: [NgFor, NgIf, TranslateModule, LoadingSpinnerComponent, MatIconModule, MatButtonModule, RouterLink],
  template: `
    <div class="app-page sa-dashboard" *ngIf="!loading; else loadingTpl">

      <!-- Welcome bar — styled via vzeeta-estate-refinement DS tokens -->
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
      <div class="sa-kpi-grid admin-kpi-grid">
        <article class="sa-kpi-card">
          <div class="sa-kpi-top">
            <span class="sa-kpi-label">{{ 'ADMIN.TOTAL_CLINICS' | translate }}</span>
            <div class="sa-kpi-icon-wrap indigo"><mat-icon>local_hospital</mat-icon></div>
          </div>
          <div class="sa-kpi-value">{{ clinicCount }}</div>
          <a routerLink="/super-admin/clinics" class="sa-kpi-link">
            {{ 'COMMON.VIEW_ALL' | translate }} <mat-icon>arrow_forward</mat-icon>
          </a>
        </article>

        <article class="sa-kpi-card">
          <div class="sa-kpi-top">
            <span class="sa-kpi-label">{{ 'ADMIN.TOTAL_USERS' | translate }}</span>
            <div class="sa-kpi-icon-wrap blue"><mat-icon>people</mat-icon></div>
          </div>
          <div class="sa-kpi-value">{{ userCount }}</div>
          <a routerLink="/super-admin/users" class="sa-kpi-link">
            {{ 'COMMON.VIEW_ALL' | translate }} <mat-icon>arrow_forward</mat-icon>
          </a>
        </article>

        <article class="sa-kpi-card warn-card">
          <div class="sa-kpi-top">
            <span class="sa-kpi-label">{{ 'ADMIN.PENDING_VERIFICATION' | translate }}</span>
            <div class="sa-kpi-icon-wrap orange"><mat-icon>pending</mat-icon></div>
          </div>
          <div class="sa-kpi-value">{{ pendingCount }}</div>
          <a routerLink="/super-admin/verification" class="sa-kpi-link warn-link">
            {{ 'ADMIN.REVIEW_NOW' | translate }} <mat-icon>arrow_forward</mat-icon>
          </a>
        </article>

        <article class="sa-kpi-card">
          <div class="sa-kpi-top">
            <span class="sa-kpi-label">{{ 'ADMIN.TOTAL_PAYMENTS' | translate }}</span>
            <div class="sa-kpi-icon-wrap teal"><mat-icon>payments</mat-icon></div>
          </div>
          <div class="sa-kpi-value">{{ paymentCount }}</div>
          <a routerLink="/super-admin/payments" class="sa-kpi-link">
            {{ 'COMMON.VIEW_ALL' | translate }} <mat-icon>arrow_forward</mat-icon>
          </a>
        </article>
      </div>

      <!-- Quick Nav -->
      <div class="sa-quick-nav">
        <h2 class="sa-section-title">{{ 'ADMIN.MANAGEMENT' | translate }}</h2>
        <div class="sa-nav-grid">
          <a *ngFor="let nav of quickNav" [routerLink]="nav.route" class="sa-nav-card" [attr.data-tone]="nav.tone">
            <span class="sa-nav-icon-wrap" [attr.data-tone]="nav.tone">
              <mat-icon>{{ nav.icon }}</mat-icon>
            </span>
            <span class="sa-nav-label">{{ nav.labelKey | translate }}</span>
            <mat-icon class="sa-nav-arrow">chevron_left</mat-icon>
          </a>
        </div>
      </div>
    </div>
    <ng-template #loadingTpl><app-loading-spinner [local]="true"></app-loading-spinner></ng-template>
  `,
  styles: [`
    .sa-dashboard { display: flex; flex-direction: column; gap: 24px; }
    .sa-welcome-left { display: flex; align-items: center; gap: 14px; }
    .sa-welcome-actions { display: flex; gap: 10px; flex-wrap: wrap; }
    .sa-kpi-link { display: inline-flex; align-items: center; gap: 2px; text-decoration: none; }
    .sa-kpi-link mat-icon { font-size: 14px !important; width: 14px !important; height: 14px !important; }
    .sa-kpi-link:hover { text-decoration: underline; }
    @media (max-width: 900px) { .sa-nav-grid { grid-template-columns: repeat(2, 1fr) !important; } }
    @media (max-width: 560px) { .sa-nav-grid { grid-template-columns: 1fr 1fr !important; } }
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
    { route: '/super-admin/lookups', icon: 'list_alt', labelKey: 'NAV.LOOKUPS', tone: 'green' },
    { route: '/super-admin/permissions', icon: 'security', labelKey: 'NAV.PERMISSIONS', tone: 'purple' },
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
  imports: [NgFor, NgIf, NgClass, FormsModule, TranslateModule, MatButtonModule, MatIconModule, PageHeaderComponent, EmptyStateComponent, TablePagerComponent, MatProgressSpinnerModule, MatTooltipModule],
  template: `
    <div class="app-page">
      <app-page-header titleKey="NAV.CLINICS" subtitleKey="ADMIN.CLINICS_SUBTITLE">
        <button mat-flat-button color="primary" type="button" (click)="openCreate()">
          <mat-icon>add</mat-icon> {{ 'ADMIN.ADD_CLINIC' | translate }}
        </button>
      </app-page-header>
      <div *ngIf="listLoad.showInitialSpinner" class="loading-wrap"><mat-spinner diameter="40"></mat-spinner></div>
      <app-empty-state *ngIf="listLoad.showSurface && rows.length === 0 && !hasActiveFilters()" icon="local_hospital" titleKey="COMMON.NO_DATA"></app-empty-state>
      <div class="app-list-surface" [class.is-refreshing]="listLoad.refreshing" *ngIf="listLoad.showSurface && (rows.length > 0 || hasActiveFilters())">
        <div class="list-refresh-spinner" *ngIf="listLoad.refreshing"><mat-spinner diameter="32"></mat-spinner></div>
        <section class="app-card table-card">
          <div class="estate-table-toolbar directory-toolbar">
            <label class="estate-search-inline"><span class="material-icons">search</span>
              <input [(ngModel)]="searchTerm" (ngModelChange)="onSearch()" [placeholder]="'NAV.CLINICS' | translate">
            </label>
          </div>
          <div class="app-table-wrap"><table class="app-data-table"><thead><tr>
            <th class="table-index-col">#</th>
            <th>{{ 'NAV.CLINICS' | translate }}</th>
            <th>{{ 'AUTH.EMAIL' | translate }}</th>
            <th class="center-col">{{ 'COMMON.STATUS' | translate }}</th>
            <th class="actions-col">{{ 'COMMON.ACTIONS' | translate }}</th>
          </tr></thead><tbody>
            <tr *ngFor="let c of rows; let i = index">
              <td class="table-index-col">{{ pageIndex * pageSize + i + 1 }}</td>
              <td>
                <div class="table-entity-cell">
                  <div class="table-entity-initial">{{ (c.nameAr || c.nameEn || '?').charAt(0) }}</div>
                  <div>
                    <div class="table-entity-name">{{ c.nameAr || c.nameEn }}</div>
                    <div class="table-entity-sub" *ngIf="c.nameEn && c.nameAr">{{ c.nameEn }}</div>
                  </div>
                </div>
              </td>
              <td>
                <div>{{ c.email }}</div>
                <div class="table-entity-sub" *ngIf="c.phone">{{ c.phone }}</div>
              </td>
              <td class="center-col">
                <span class="status-chip" [ngClass]="c.verified ? 'chip-success' : 'chip-warning'">
                  {{ c.verified ? ('ADMIN.VERIFIED' | translate) : ('ADMIN.PENDING' | translate) }}
                </span>
              </td>
              <td class="actions-col">
                <div class="app-row-actions">
                  <button class="app-icon-btn info" type="button" (click)="openEdit(c)" [matTooltip]="'COMMON.EDIT' | translate">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button class="app-icon-btn danger" type="button" (click)="confirmDeactivate(c)" [matTooltip]="'ACTIONS.DELETE' | translate" [disabled]="!c.active">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </td>
            </tr>
            <tr *ngIf="rows.length === 0">
              <td colspan="5" class="empty-row">{{ 'COMMON.NO_DATA' | translate }}</td>
            </tr>
          </tbody></table></div>
          <app-table-pager [length]="totalElements" [pageSize]="pageSize" [pageIndex]="pageIndex" (pageIndexChange)="onPageChange($event)"/>
        </section>
      </div>
    </div>
  `
})
export class SuperAdminClinicsComponent implements OnInit {
  listLoad = new ListLoadController();
  rows: AdminClinic[] = [];
  pageIndex = 0;
  pageSize = DEFAULT_TABLE_PAGE_SIZE;
  totalElements = 0;
  searchTerm = '';
  private searchTimer?: ReturnType<typeof setTimeout>;
  private readonly dialogConfig = {
    width: '560px',
    maxWidth: '95vw',
    panelClass: 'app-dialog-panel',
    disableClose: true
  } as const;

  constructor(
    private readonly admin: SuperAdminService,
    private readonly snack: SnackService,
    private readonly i18n: I18nService,
    private readonly dialog: MatDialog
  ) {}
  ngOnInit(): void { this.load(); }
  load(): void {
    this.listLoad.begin();
    this.admin.getClinics(withPageParams(this.pageIndex, this.pageSize, { q: this.searchTerm })).subscribe({
      next: (res) => { this.rows = res.content; this.totalElements = res.totalElements; this.listLoad.end(); },
      error: () => { this.rows = []; this.totalElements = 0; this.listLoad.end(); }
    });
  }
  openCreate(): void {
    this.dialog.open(ClinicDialogComponent, {
      ...this.dialogConfig,
      data: { clinic: null }
    }).afterClosed().subscribe((ok) => { if (ok) this.load(); });
  }
  openEdit(c: AdminClinic): void {
    this.dialog.open(ClinicDialogComponent, {
      ...this.dialogConfig,
      data: { clinic: c }
    }).afterClosed().subscribe((ok) => { if (ok) this.load(); });
  }
  confirmDeactivate(c: AdminClinic): void {
    if (!c.active) {
      this.snack.error(this.i18n.instant('ADMIN.CLINIC_ALREADY_INACTIVE'));
      return;
    }
    this.dialog.open(ConfirmDialogComponent, {
      width: '440px',
      panelClass: 'app-dialog-panel',
      data: {
        title: 'ACTIONS.DELETE',
        message: 'ADMIN.DEACTIVATE_CLINIC_CONFIRM',
        danger: true,
        confirmLabel: 'ACTIONS.DELETE'
      }
    }).afterClosed().subscribe((ok) => {
      if (!ok) return;
      this.admin.saveClinic({ ...c, active: false }).subscribe({
        next: () => {
          this.snack.success(this.i18n.instant('ADMIN.CLINIC_SAVED'));
          this.load();
        }
      });
    });
  }
  onPageChange(i: number): void { this.pageIndex = i; this.load(); }
  onSearch(): void { clearTimeout(this.searchTimer); this.searchTimer = setTimeout(() => { this.pageIndex = 0; this.load(); }, 300); }
  hasActiveFilters(): boolean { return !!this.searchTerm?.trim(); }
}

@Component({
  selector: 'app-super-admin-users',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, FormsModule, TranslateModule, MatButtonModule, MatIconModule, PageHeaderComponent, EmptyStateComponent, TablePagerComponent, MatProgressSpinnerModule, MatTooltipModule],
  template: `
    <div class="app-page">
      <app-page-header titleKey="NAV.USERS" subtitleKey="ADMIN.USERS_SUBTITLE"></app-page-header>
      <div *ngIf="listLoad.showInitialSpinner" class="loading-wrap"><mat-spinner diameter="40"></mat-spinner></div>
      <app-empty-state *ngIf="listLoad.showSurface && rows.length === 0 && !hasActiveFilters()" icon="people" titleKey="COMMON.NO_DATA"></app-empty-state>
      <div class="app-list-surface" [class.is-refreshing]="listLoad.refreshing" *ngIf="listLoad.showSurface && (rows.length > 0 || hasActiveFilters())">
        <div class="list-refresh-spinner" *ngIf="listLoad.refreshing"><mat-spinner diameter="32"></mat-spinner></div>
        <section class="app-card table-card">
          <div class="estate-table-toolbar directory-toolbar">
            <label class="estate-search-inline"><span class="material-icons">search</span>
              <input [(ngModel)]="searchTerm" (ngModelChange)="onSearch()" [placeholder]="'NAV.USERS' | translate">
            </label>
          </div>
          <div class="app-table-wrap"><table class="app-data-table"><thead><tr>
            <th class="table-index-col">#</th>
            <th>{{ 'NAV.USERS' | translate }}</th>
            <th class="center-col">{{ 'AUTH.ROLE' | translate }}</th>
            <th class="center-col">{{ 'COMMON.STATUS' | translate }}</th>
            <th class="actions-col">{{ 'COMMON.ACTIONS' | translate }}</th>
          </tr></thead><tbody>
            <tr *ngFor="let u of rows; let i = index">
              <td class="table-index-col">{{ pageIndex * pageSize + i + 1 }}</td>
              <td>
                <div class="table-entity-cell">
                  <div class="table-entity-initial">{{ (u.fullNameAr || u.fullNameEn || u.email || '?').charAt(0) }}</div>
                  <div>
                    <div class="table-entity-name">{{ u.fullNameAr || u.fullNameEn || u.email }}</div>
                    <div class="table-entity-sub">{{ u.email }}</div>
                  </div>
                </div>
              </td>
              <td class="center-col">
                <span class="status-chip chip-info">{{ ('ROLES.' + u.role) | translate }}</span>
              </td>
              <td class="center-col">
                <span class="status-chip" [ngClass]="u.active ? 'chip-success' : 'chip-danger'">
                  {{ u.active ? ('ADMIN.ACTIVE' | translate) : ('ADMIN.INACTIVE' | translate) }}
                </span>
              </td>
              <td class="actions-col">
                <div class="app-row-actions">
                  <button class="app-icon-btn info" type="button" (click)="openEdit(u)" [matTooltip]="'COMMON.EDIT' | translate">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button class="app-icon-btn danger" type="button" (click)="confirmDeactivate(u)" [matTooltip]="'ACTIONS.DELETE' | translate">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </td>
            </tr>
            <tr *ngIf="rows.length === 0">
              <td colspan="5" class="empty-row">{{ 'COMMON.NO_DATA' | translate }}</td>
            </tr>
          </tbody></table></div>
          <app-table-pager [length]="totalElements" [pageSize]="pageSize" [pageIndex]="pageIndex" (pageIndexChange)="onPageChange($event)"/>
        </section>
      </div>
    </div>
  `
})
export class SuperAdminUsersComponent implements OnInit {
  listLoad = new ListLoadController();
  rows: AdminUser[] = [];
  pageIndex = 0;
  pageSize = DEFAULT_TABLE_PAGE_SIZE;
  totalElements = 0;
  searchTerm = '';
  private searchTimer?: ReturnType<typeof setTimeout>;
  private readonly dialogConfig = {
    width: '520px',
    maxWidth: '95vw',
    panelClass: 'app-dialog-panel',
    disableClose: true
  } as const;

  constructor(
    private readonly admin: SuperAdminService,
    private readonly snack: SnackService,
    private readonly i18n: I18nService,
    private readonly dialog: MatDialog
  ) {}
  ngOnInit(): void { this.load(); }
  load(): void {
    this.listLoad.begin();
    this.admin.getUsers(withPageParams(this.pageIndex, this.pageSize, { q: this.searchTerm })).subscribe({
      next: (res) => { this.rows = res.content; this.totalElements = res.totalElements; this.listLoad.end(); },
      error: () => { this.rows = []; this.totalElements = 0; this.listLoad.end(); }
    });
  }
  confirmDeactivate(u: AdminUser): void {
    if (!u.active) {
      this.snack.error(this.i18n.instant('ADMIN.USER_ALREADY_INACTIVE'));
      return;
    }
    this.dialog.open(ConfirmDialogComponent, {
      width: '440px',
      panelClass: 'app-dialog-panel',
      data: {
        title: 'ACTIONS.DELETE',
        message: 'ADMIN.DEACTIVATE_USER_CONFIRM',
        danger: true,
        confirmLabel: 'ACTIONS.DELETE'
      }
    }).afterClosed().subscribe((ok) => {
      if (!ok) return;
      this.toggleActive(u);
    });
  }
  toggleActive(u: AdminUser): void {
    this.admin.updateUser(u.id, { active: !u.active, fullNameAr: u.fullNameAr }).subscribe({
      next: () => { this.snack.success(this.i18n.instant('ADMIN.USER_UPDATED')); this.load(); }
    });
  }
  openEdit(u: AdminUser): void {
    this.dialog.open(AdminUserDialogComponent, {
      ...this.dialogConfig,
      data: { user: u }
    }).afterClosed().subscribe((ok) => { if (ok) this.load(); });
  }
  onPageChange(i: number): void { this.pageIndex = i; this.load(); }
  onSearch(): void { clearTimeout(this.searchTimer); this.searchTimer = setTimeout(() => { this.pageIndex = 0; this.load(); }, 300); }
  hasActiveFilters(): boolean { return !!this.searchTerm?.trim(); }
}

@Component({
  selector: 'app-super-admin-verification',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, TranslateModule, MatButtonModule, MatIconModule, MatTooltipModule, PageHeaderComponent, EmptyStateComponent, TablePagerComponent, MatProgressSpinnerModule],
  template: `
    <div class="app-page">
      <app-page-header titleKey="NAV.VERIFICATION"></app-page-header>
      <div *ngIf="listLoad.showInitialSpinner" class="loading-wrap"><mat-spinner diameter="40"></mat-spinner></div>
      <app-empty-state *ngIf="listLoad.showSurface && rows.length === 0 && !hasActiveFilters()" icon="verified" titleKey="ADMIN.NO_PENDING"></app-empty-state>
      <div class="app-list-surface" [class.is-refreshing]="listLoad.refreshing" *ngIf="listLoad.showSurface && (rows.length > 0 || hasActiveFilters())">
        <div class="list-refresh-spinner" *ngIf="listLoad.refreshing"><mat-spinner diameter="32"></mat-spinner></div>
        <section class="app-card table-card">
          <div class="estate-table-toolbar directory-toolbar">
            <label class="estate-search-inline"><span class="material-icons">search</span>
              <input [(ngModel)]="searchTerm" (ngModelChange)="onSearch()" [placeholder]="'NAV.VERIFICATION' | translate">
            </label>
          </div>
          <div class="app-table-wrap"><table class="app-data-table"><thead><tr>
            <th>{{ 'DOCTOR.DOCTOR' | translate }}</th><th>{{ 'COMMON.EGP' | translate }}</th><th class="actions-col">{{ 'COMMON.ACTIONS' | translate }}</th>
          </tr></thead><tbody>
            <tr *ngFor="let d of rows">
              <td>{{ d.titleAr || ('DOCTOR.DOCTOR' | translate) }} #{{ d.id }}</td>
              <td>{{ d.consultationFee }}</td>
              <td class="actions-col">
                <div class="table-actions app-row-actions">
                  <button type="button" class="app-icon-btn success" (click)="verify(d)" [matTooltip]="'ADMIN.VERIFY' | translate">
                    <mat-icon>verified</mat-icon>
                  </button>
                </div>
              </td>
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
        <section class="app-card table-card">
          <div class="estate-table-toolbar directory-toolbar">
            <div class="directory-toolbar-top table-list-toolbar">
              <label class="estate-search-inline"><span class="material-icons">search</span>
                <input [(ngModel)]="searchTerm" (ngModelChange)="onSearch()" [placeholder]="'NAV.PAYMENTS' | translate">
              </label>
              <mat-form-field appearance="outline" class="filter-field" floatLabel="always" subscriptSizing="dynamic">
                <mat-label>{{ 'COMMON.FILTER_STATUS' | translate }}</mat-label>
                <mat-select [(ngModel)]="statusFilter" (selectionChange)="onStatusChange()">
                  <mat-option value="">{{ 'COMMON.ALL' | translate }}</mat-option>
                  <mat-option *ngFor="let s of paymentStatuses" [value]="s">{{ 'PAYMENT_STATUS.' + s | translate }}</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
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
  imports: [NgFor, NgIf, FormsModule, TranslateModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatTooltipModule, PageHeaderComponent, EmptyStateComponent, TablePagerComponent, MatProgressSpinnerModule],
  template: `
    <div class="app-page">
      <app-page-header titleKey="NAV.SETTINGS"></app-page-header>
      <div *ngIf="listLoad.showInitialSpinner" class="loading-wrap"><mat-spinner diameter="40"></mat-spinner></div>
      <app-empty-state *ngIf="listLoad.showSurface && rows.length === 0 && !hasActiveFilters()" icon="settings" titleKey="COMMON.NO_DATA"></app-empty-state>
      <div class="app-list-surface" [class.is-refreshing]="listLoad.refreshing" *ngIf="listLoad.showSurface && (rows.length > 0 || hasActiveFilters())">
        <div class="list-refresh-spinner" *ngIf="listLoad.refreshing"><mat-spinner diameter="32"></mat-spinner></div>
        <section class="app-card table-card">
          <div class="estate-table-toolbar directory-toolbar">
            <label class="estate-search-inline"><span class="material-icons">search</span>
              <input [(ngModel)]="searchTerm" (ngModelChange)="onSearch()" [placeholder]="'NAV.SETTINGS' | translate">
            </label>
          </div>
          <div class="app-table-wrap"><table class="app-data-table"><thead><tr>
            <th>{{ 'NAV.SETTINGS' | translate }}</th><th>{{ 'COMMON.ALL' | translate }}</th><th class="actions-col">{{ 'COMMON.ACTIONS' | translate }}</th>
          </tr></thead><tbody>
            <tr *ngFor="let s of rows">
              <td><strong>{{ s.settingKey }}</strong><br><span class="muted">{{ s.description }}</span></td>
              <td>
                <mat-form-field appearance="outline" *ngIf="editKey === s.settingKey">
                  <input matInput [(ngModel)]="editValue">
                </mat-form-field>
                <span *ngIf="editKey !== s.settingKey">{{ s.settingValue }}</span>
              </td>
              <td class="actions-col">
                <div class="table-actions app-row-actions" *ngIf="editKey !== s.settingKey">
                  <button type="button" class="app-icon-btn info" (click)="startEdit(s)" [matTooltip]="'COMMON.EDIT' | translate">
                    <mat-icon>edit</mat-icon>
                  </button>
                </div>
                <div class="table-actions app-row-actions" *ngIf="editKey === s.settingKey">
                  <button type="button" class="app-icon-btn success" (click)="saveEdit(s)" [matTooltip]="'COMMON.SAVE' | translate">
                    <mat-icon>check</mat-icon>
                  </button>
                  <button type="button" class="app-icon-btn danger" (click)="cancelEdit()" [matTooltip]="'COMMON.CANCEL' | translate">
                    <mat-icon>close</mat-icon>
                  </button>
                </div>
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
          <mat-form-field appearance="outline" class="filter-field" floatLabel="always" subscriptSizing="dynamic">
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
    private readonly snack: SnackService,
    private readonly i18n: I18nService
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
        this.snack.success(this.i18n.instant('COMMON.SAVED'));
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
