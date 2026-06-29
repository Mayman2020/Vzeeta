import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, SlicePipe } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { FeatureShellComponent } from '../../shared/components/feature-shell/feature-shell.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { TablePagerComponent } from '../../shared/components/table-pager/table-pager.component';
import { ListLoadController } from '../../shared/utils/list-load.util';
import { DEFAULT_TABLE_PAGE_SIZE, withPageParams } from '../../core/utils/pagination.util';
import { RmsDatePipe } from '../../shared/pipes/rms-date.pipe';
import {
  ClinicAdminService,
  ClinicAnalytics,
  ClinicBranch,
  ClinicDoctor,
  ClinicLabResult,
  ClinicPatient,
  ClinicServiceItem,
  ClinicSpecialty,
  CreateDoctorRequest
} from '../../core/services/clinic-admin.service';
import { Appointment } from '../../core/models/appointment.model';
import { SnackService } from '../../core/services/snack.service';
import { I18nService } from '../../core/i18n/i18n.service';

@Component({
  selector: 'app-clinic-admin-dashboard',
  standalone: true,
  imports: [NgFor, NgIf, SlicePipe, TranslateModule, MatProgressSpinnerModule, MatButtonModule, MatIconModule],
  template: `
    <div class="app-page dashboard-page">
      <div *ngIf="loading" class="loading-center"><mat-spinner diameter="40"></mat-spinner></div>

      <ng-container *ngIf="!loading">
        <div class="estate-stat-grid">
          <article class="estate-stat-card navy">
            <div class="estate-stat-top">
              <span class="estate-stat-label">{{ 'CLINIC.MONTH_APPOINTMENTS' | translate }}</span>
              <div class="estate-stat-icon"><span class="material-icons">event</span></div>
            </div>
            <div class="estate-stat-value">{{ analytics.appointmentCount }}</div>
            <div class="estate-stat-foot">
              <span>{{ analytics.todayCount }} {{ 'COMMON.TODAY' | translate }}</span>
            </div>
          </article>

          <article class="estate-stat-card teal">
            <div class="estate-stat-top">
              <span class="estate-stat-label">{{ 'CLINIC.ACTIVE_DOCTORS' | translate }}</span>
              <div class="estate-stat-icon"><span class="material-icons">medical_services</span></div>
            </div>
            <div class="estate-stat-value">{{ analytics.doctorCount }}</div>
            <div class="estate-stat-foot">
              <span>{{ analytics.branchCount }} {{ 'NAV.BRANCHES' | translate }}</span>
            </div>
          </article>

          <article class="estate-stat-card gold">
            <div class="estate-stat-top">
              <span class="estate-stat-label">{{ 'APPOINTMENT.PENDING' | translate }}</span>
              <div class="estate-stat-icon"><span class="material-icons">pending_actions</span></div>
            </div>
            <div class="estate-stat-value">{{ analytics.pendingCount }}</div>
            <div class="estate-stat-foot">
              <span>{{ 'APPOINTMENT.STATUS_PENDING' | translate }}</span>
            </div>
          </article>

          <article class="estate-stat-card danger">
            <div class="estate-stat-top">
              <span class="estate-stat-label">{{ 'APPOINTMENT.CANCELLED' | translate }}</span>
              <div class="estate-stat-icon"><span class="material-icons">event_busy</span></div>
            </div>
            <div class="estate-stat-value">{{ analytics.cancelledCount }}</div>
            <div class="estate-stat-foot">
              <span>{{ 'APPOINTMENT.STATUS_CANCELLED' | translate }}</span>
            </div>
          </article>
        </div>

        <!-- Today Appointments -->
        <div class="appt-panel">
          <div class="appt-panel-head">
            <h3 class="appt-panel-title">{{ 'CLINIC.TODAY_APPOINTMENTS' | translate }} <span class="appt-count">({{ todayAppointments.length }})</span></h3>
          </div>
          <div class="appt-grid" *ngIf="todayAppointments.length > 0; else noAppts">
            <div class="appt-card" *ngFor="let a of todayAppointments">
              <div class="appt-card-row">
                <div class="appt-avatar" [style.background]="avatarColor(a.patientNameAr || a.patientNameEn || 'P')">
                  {{ initials(a.patientNameAr || a.patientNameEn) }}
                </div>
                <div class="appt-info">
                  <div class="appt-name">{{ a.patientNameAr || a.patientNameEn || ('PATIENT.PATIENT' | translate) + ' #' + a.patientId }}</div>
                  <div class="appt-type">{{ a.specialtyNameAr || a.consultationType }}</div>
                  <span class="status-badge" [attr.data-status]="a.status">{{ a.status }}</span>
                </div>
              </div>
              <div class="appt-time">{{ a.startTime | slice:0:5 }}</div>
              <div class="appt-date">{{ a.appointmentDate }}</div>
            </div>
          </div>
          <ng-template #noAppts>
            <div class="appt-empty"><span class="material-icons">event_available</span><p>{{ 'APPOINTMENT.NO_TODAY' | translate }}</p></div>
          </ng-template>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .appt-panel { background: var(--surface); border: 1px solid var(--card-border); border-radius: var(--r); overflow: hidden; box-shadow: var(--shadow-card); }
    .appt-panel-head { padding: 18px 22px; border-bottom: 1px solid var(--line); }
    .appt-panel-title { font-size: 1rem; font-weight: 700; color: var(--text-main); margin: 0; }
    .appt-count { color: var(--text-muted); font-weight: 500; margin-inline-start: 6px; }
    .appt-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 1px; background: var(--line); }
    .appt-card { background: var(--surface); padding: 16px; display: flex; flex-direction: column; gap: 8px; }
    .appt-card-row { display: flex; align-items: flex-start; gap: 10px; }
    .appt-avatar { width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; font-size: 0.8rem; font-weight: 700; color: #fff; flex-shrink: 0; }
    .appt-info { flex: 1; min-width: 0; }
    .appt-name { font-weight: 600; font-size: 0.875rem; color: var(--text-main); margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .appt-type { font-size: 0.75rem; color: var(--text-muted); margin-bottom: 4px; }
    .appt-time { font-size: 1.35rem; font-weight: 700; color: var(--text-main); }
    .appt-date { font-size: 0.75rem; color: var(--text-subtle); }
    .appt-empty { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 48px 24px; color: var(--text-subtle); }
    .appt-empty .material-icons { font-size: 40px; opacity: 0.35; }
    @media (max-width: 1200px) { .appt-grid { grid-template-columns: repeat(2,1fr); } }
    @media (max-width: 700px) { .appt-grid { grid-template-columns: 1fr; } }
  `]
})
export class ClinicAdminDashboardComponent implements OnInit {
  loading = true;
  analytics: ClinicAnalytics = { doctorCount: 0, branchCount: 0, appointmentCount: 0, todayCount: 0, cancelledCount: 0, pendingCount: 0 };
  todayAppointments: Appointment[] = [];

  private readonly AVATAR_COLORS = ['#2563eb','#db2777','#059669','#ea580c','#7c3aed','#0284c7','#ca8a04'];

  constructor(private readonly clinicAdmin: ClinicAdminService) {}

  ngOnInit(): void {
    const today = new Date().toISOString().split('T')[0];
    this.clinicAdmin.getAnalytics().subscribe({
      next: (a) => { this.analytics = a; },
      error: () => {}
    });
    this.clinicAdmin.getAppointments({ date: today, size: 20, page: 0, sort: 'startTime,asc' }).subscribe({
      next: (res) => { this.todayAppointments = res.content; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  initials(name?: string): string {
    if (!name) return '?';
    return name.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase();
  }

  avatarColor(name: string): string {
    const idx = name.charCodeAt(0) % this.AVATAR_COLORS.length;
    return this.AVATAR_COLORS[idx];
  }
}

@Component({
  selector: 'app-clinic-doctors',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, ReactiveFormsModule, TranslateModule, MatChipsModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatCheckboxModule, MatCardModule, PageHeaderComponent, EmptyStateComponent, TablePagerComponent, MatProgressSpinnerModule],
  template: `
    <div class="app-page">
      <app-page-header titleKey="NAV.DOCTORS">
        <button mat-flat-button color="primary" type="button" (click)="openCreate()">
          <mat-icon>person_add</mat-icon> {{ 'CLINIC.ADD_DOCTOR' | translate }}
        </button>
      </app-page-header>
      <div *ngIf="listLoad.showInitialSpinner" class="loading-wrap"><mat-spinner diameter="40"></mat-spinner></div>
      <app-empty-state *ngIf="listLoad.showSurface && rows.length === 0 && !hasActiveFilters()" icon="medical_information" titleKey="COMMON.NO_DATA"></app-empty-state>
      <div class="app-list-surface" [class.is-refreshing]="listLoad.refreshing" *ngIf="listLoad.showSurface && (rows.length > 0 || hasActiveFilters())">
        <div class="list-refresh-spinner" *ngIf="listLoad.refreshing"><mat-spinner diameter="32"></mat-spinner></div>
        <section class="list-stats"><article class="stat-pill"><span class="stat-label">{{ 'COMMON.ALL' | translate }}</span><strong>{{ totalElements }}</strong></article></section>
        <section class="app-card table-card">
          <div class="estate-table-toolbar">
            <label class="estate-search-inline"><span class="material-icons">search</span>
              <input [(ngModel)]="searchTerm" (ngModelChange)="onSearch()" [placeholder]="'NAV.DOCTORS' | translate">
            </label>
          </div>
          <div class="app-table-wrap"><table class="app-data-table"><thead><tr>
            <th>{{ 'LOOKUPS.NAME_AR' | translate }}</th><th>{{ 'COMMON.EMAIL' | translate }}</th><th>{{ 'COMMON.EGP' | translate }}</th><th>{{ 'COMMON.STATUS' | translate }}</th><th>{{ 'COMMON.ACTIONS' | translate }}</th>
          </tr></thead><tbody>
            <tr *ngFor="let d of rows">
              <td>{{ d.user?.fullNameAr || d.user?.fullNameEn || ('DOCTOR.DOCTOR' | translate) + ' #' + d.id }}</td>
              <td>{{ d.user?.email || '-' }}</td>
              <td>{{ d.consultationFee }}</td>
              <td><span class="status-badge" [attr.data-status]="d.verified ? 'ACTIVE' : 'INACTIVE'">{{ d.verified ? ('ADMIN.VERIFIED' | translate) : ('ADMIN.PENDING' | translate) }}</span></td>
              <td><button mat-stroked-button type="button" (click)="openEdit(d)">{{ 'COMMON.EDIT' | translate }}</button></td>
            </tr>
          </tbody></table></div>
          <app-table-pager [length]="totalElements" [pageSize]="pageSize" [pageIndex]="pageIndex" (pageIndexChange)="onPageChange($event)"/>
        </section>
      </div>

      <!-- Create Doctor Dialog -->
      <div class="dialog-backdrop" *ngIf="showCreateDialog" (click)="closeDialogs()">
        <mat-card class="dialog-panel" (click)="$event.stopPropagation()">
          <h3>{{ 'CLINIC.ADD_DOCTOR' | translate }}</h3>
          <form [formGroup]="createForm" (ngSubmit)="submitCreate()" class="dialog-form">
            <mat-form-field appearance="outline"><mat-label>{{ 'LOOKUPS.NAME_AR' | translate }}</mat-label><input matInput formControlName="fullNameAr"></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>{{ 'LOOKUPS.NAME_EN' | translate }}</mat-label><input matInput formControlName="fullNameEn"></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>{{ 'COMMON.EMAIL' | translate }}</mat-label><input matInput type="email" formControlName="email"></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>{{ 'COMMON.PHONE' | translate }}</mat-label><input matInput formControlName="phone"></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>{{ 'CLINIC.DOCTOR_TITLE' | translate }}</mat-label><input matInput formControlName="titleAr"></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>{{ 'COMMON.EGP' | translate }}</mat-label><input matInput type="number" formControlName="consultationFee"></mat-form-field>
            <div class="checkbox-row">
              <mat-checkbox formControlName="acceptsOnline">{{ 'DOCTOR.ACCEPTS_ONLINE' | translate }}</mat-checkbox>
              <mat-checkbox formControlName="acceptsInClinic">{{ 'DOCTOR.ACCEPTS_IN_CLINIC' | translate }}</mat-checkbox>
            </div>
            <p class="hint-text">{{ 'CLINIC.DOCTOR_DEFAULT_PASS' | translate }}</p>
            <div class="dialog-actions">
              <button mat-button type="button" (click)="closeDialogs()">{{ 'COMMON.CANCEL' | translate }}</button>
              <button mat-flat-button color="primary" type="submit" [disabled]="createForm.invalid || saving">{{ 'COMMON.SAVE' | translate }}</button>
            </div>
          </form>
        </mat-card>
      </div>

      <!-- Edit Doctor Dialog -->
      <div class="dialog-backdrop" *ngIf="showEditDialog" (click)="closeDialogs()">
        <mat-card class="dialog-panel" (click)="$event.stopPropagation()">
          <h3>{{ 'CLINIC.EDIT_DOCTOR' | translate }}</h3>
          <form [formGroup]="editForm" (ngSubmit)="saveDoctor()" class="dialog-form">
            <mat-form-field appearance="outline"><mat-label>{{ 'CLINIC.DOCTOR_TITLE' | translate }}</mat-label><input matInput formControlName="titleAr"></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>{{ 'COMMON.EGP' | translate }}</mat-label><input matInput type="number" formControlName="consultationFee"></mat-form-field>
            <div class="dialog-actions">
              <button mat-button type="button" (click)="closeDialogs()">{{ 'COMMON.CANCEL' | translate }}</button>
              <button mat-flat-button color="primary" type="submit" [disabled]="editForm.invalid || saving">{{ 'COMMON.SAVE' | translate }}</button>
            </div>
          </form>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dialog-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 1rem; }
    .dialog-panel { padding: 1.5rem; min-width: 340px; max-width: 520px; width: 100%; max-height: 90vh; overflow-y: auto; }
    .dialog-form { display: flex; flex-direction: column; gap: 0.5rem; }
    .dialog-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.5rem; }
    .checkbox-row { display: flex; gap: 1.5rem; align-items: center; padding: 0.25rem 0; }
    .hint-text { font-size: 0.78rem; color: var(--text-subtle); margin: 0; }
  `]
})
export class ClinicDoctorsComponent implements OnInit {
  listLoad = new ListLoadController();
  rows: ClinicDoctor[] = [];
  pageIndex = 0;
  pageSize = DEFAULT_TABLE_PAGE_SIZE;
  totalElements = 0;
  searchTerm = '';
  showCreateDialog = false;
  showEditDialog = false;
  editingDoctor: ClinicDoctor | null = null;
  saving = false;
  createForm: FormGroup;
  editForm: FormGroup;
  private searchTimer?: ReturnType<typeof setTimeout>;

  constructor(
    fb: FormBuilder,
    private readonly clinicAdmin: ClinicAdminService,
    private readonly snack: SnackService,
    private readonly i18n: I18nService
  ) {
    this.createForm = fb.group({
      fullNameAr: ['', Validators.required],
      fullNameEn: [''],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      titleAr: [''],
      consultationFee: [0, Validators.required],
      acceptsOnline: [true],
      acceptsInClinic: [true]
    });
    this.editForm = fb.group({ titleAr: ['', Validators.required], consultationFee: [0, Validators.required] });
  }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.listLoad.begin();
    this.clinicAdmin.getDoctors(withPageParams(this.pageIndex, this.pageSize, { q: this.searchTerm })).subscribe({
      next: (res) => { this.rows = res.content; this.totalElements = res.totalElements; this.listLoad.end(); },
      error: () => { this.rows = []; this.totalElements = 0; this.listLoad.end(); }
    });
  }

  openCreate(): void { this.createForm.reset({ consultationFee: 0, acceptsOnline: true, acceptsInClinic: true }); this.showCreateDialog = true; }

  submitCreate(): void {
    if (this.createForm.invalid || this.saving) return;
    this.saving = true;
    const req: CreateDoctorRequest = this.createForm.getRawValue();
    this.clinicAdmin.createDoctor(req).subscribe({
      next: () => {
        this.snack.success(this.i18n.instant('COMMON.SAVE'));
        this.saving = false;
        this.closeDialogs();
        this.load();
      },
      error: () => { this.saving = false; }
    });
  }

  openEdit(d: ClinicDoctor): void {
    this.editingDoctor = d;
    this.editForm.patchValue({ titleAr: d.titleAr ?? '', consultationFee: d.consultationFee ?? 0 });
    this.showEditDialog = true;
  }

  closeDialogs(): void { this.showCreateDialog = false; this.showEditDialog = false; this.editingDoctor = null; }

  saveDoctor(): void {
    if (!this.editingDoctor || this.editForm.invalid || this.saving) return;
    this.saving = true;
    this.clinicAdmin.updateDoctor(this.editingDoctor.id, this.editForm.getRawValue()).subscribe({
      next: () => {
        this.snack.success(this.i18n.instant('COMMON.SAVE'));
        this.saving = false;
        this.closeDialogs();
        this.load();
      },
      error: () => { this.saving = false; }
    });
  }

  onPageChange(i: number): void { this.pageIndex = i; this.load(); }
  onSearch(): void {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => { this.pageIndex = 0; this.load(); }, 300);
  }
  hasActiveFilters(): boolean { return !!this.searchTerm?.trim(); }
}

@Component({
  selector: 'app-clinic-branches',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, ReactiveFormsModule, TranslateModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatCheckboxModule, MatCardModule, PageHeaderComponent, EmptyStateComponent, TablePagerComponent, MatProgressSpinnerModule],
  template: `
    <div class="app-page">
      <app-page-header titleKey="NAV.BRANCHES">
        <button mat-flat-button color="primary" type="button" (click)="openCreate()">
          <mat-icon>add</mat-icon> {{ 'CLINIC.ADD_BRANCH' | translate }}
        </button>
      </app-page-header>
      <div *ngIf="listLoad.showInitialSpinner" class="loading-wrap"><mat-spinner diameter="40"></mat-spinner></div>
      <app-empty-state *ngIf="listLoad.showSurface && rows.length === 0 && !hasActiveFilters()" icon="store" titleKey="COMMON.NO_DATA"></app-empty-state>
      <div class="app-list-surface" [class.is-refreshing]="listLoad.refreshing" *ngIf="listLoad.showSurface && (rows.length > 0 || hasActiveFilters())">
        <div class="list-refresh-spinner" *ngIf="listLoad.refreshing"><mat-spinner diameter="32"></mat-spinner></div>
        <section class="list-stats"><article class="stat-pill"><span class="stat-label">{{ 'COMMON.ALL' | translate }}</span><strong>{{ totalElements }}</strong></article></section>
        <section class="app-card table-card">
          <div class="estate-table-toolbar">
            <label class="estate-search-inline"><span class="material-icons">search</span>
              <input [(ngModel)]="searchTerm" (ngModelChange)="onSearch()" [placeholder]="'NAV.BRANCHES' | translate">
            </label>
          </div>
          <div class="app-table-wrap"><table class="app-data-table"><thead><tr>
            <th>{{ 'NAV.BRANCHES' | translate }}</th><th>{{ 'AUTH.PHONE' | translate }}</th><th>{{ 'COMMON.STATUS' | translate }}</th>
          </tr></thead><tbody>
            <tr *ngFor="let b of rows">
              <td>{{ b.nameAr || b.nameEn }}</td><td>{{ b.phone || '-' }}</td>
              <td><span class="status-badge" [attr.data-status]="b.active ? 'ACTIVE' : 'INACTIVE'">{{ b.active ? ('ADMIN.ACTIVE' | translate) : ('ADMIN.INACTIVE' | translate) }}</span></td>
            </tr>
          </tbody></table></div>
          <app-table-pager [length]="totalElements" [pageSize]="pageSize" [pageIndex]="pageIndex" (pageIndexChange)="onPageChange($event)"/>
        </section>
      </div>
      <div class="dialog-backdrop" *ngIf="showDialog" (click)="closeDialog()">
        <mat-card class="dialog-panel" (click)="$event.stopPropagation()">
          <h3>{{ 'CLINIC.ADD_BRANCH' | translate }}</h3>
          <form [formGroup]="branchForm" (ngSubmit)="saveBranch()" class="dialog-form">
            <mat-form-field appearance="outline"><mat-label>{{ 'LOOKUPS.NAME_AR' | translate }}</mat-label><input matInput formControlName="nameAr"></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>{{ 'LOOKUPS.NAME_EN' | translate }}</mat-label><input matInput formControlName="nameEn"></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>{{ 'AUTH.PHONE' | translate }}</mat-label><input matInput formControlName="phone"></mat-form-field>
            <mat-checkbox formControlName="active">{{ 'ADMIN.ACTIVE' | translate }}</mat-checkbox>
            <div class="dialog-actions">
              <button mat-button type="button" (click)="closeDialog()">{{ 'COMMON.CANCEL' | translate }}</button>
              <button mat-flat-button color="primary" type="submit" [disabled]="branchForm.invalid || saving">{{ 'COMMON.SAVE' | translate }}</button>
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
export class ClinicBranchesComponent implements OnInit {
  listLoad = new ListLoadController();
  rows: ClinicBranch[] = [];
  pageIndex = 0;
  pageSize = DEFAULT_TABLE_PAGE_SIZE;
  totalElements = 0;
  searchTerm = '';
  showDialog = false;
  saving = false;
  branchForm: FormGroup;
  private searchTimer?: ReturnType<typeof setTimeout>;
  constructor(
    fb: FormBuilder,
    private readonly clinicAdmin: ClinicAdminService,
    private readonly snack: SnackService,
    private readonly i18n: I18nService
  ) {
    this.branchForm = fb.group({ nameAr: ['', Validators.required], nameEn: [''], phone: [''], active: [true] });
  }
  ngOnInit(): void { this.load(); }
  load(): void {
    this.listLoad.begin();
    this.clinicAdmin.getBranches(withPageParams(this.pageIndex, this.pageSize, { q: this.searchTerm })).subscribe({
      next: (res) => { this.rows = res.content; this.totalElements = res.totalElements; this.listLoad.end(); },
      error: () => { this.rows = []; this.totalElements = 0; this.listLoad.end(); }
    });
  }
  openCreate(): void { this.branchForm.reset({ nameAr: '', nameEn: '', phone: '', active: true }); this.showDialog = true; }
  closeDialog(): void { this.showDialog = false; }
  saveBranch(): void {
    if (this.branchForm.invalid || this.saving) return;
    this.saving = true;
    this.clinicAdmin.saveBranch(this.branchForm.getRawValue()).subscribe({
      next: () => {
        this.snack.success(this.i18n.instant('COMMON.SAVE'));
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
  selector: 'app-clinic-appointments',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, TranslateModule, MatChipsModule, MatFormFieldModule, MatSelectModule, RmsDatePipe, PageHeaderComponent, EmptyStateComponent, TablePagerComponent, MatProgressSpinnerModule],
  template: `
    <div class="app-page">
      <app-page-header titleKey="NAV.APPOINTMENTS"></app-page-header>
      <div *ngIf="listLoad.showInitialSpinner" class="loading-wrap"><mat-spinner diameter="40"></mat-spinner></div>
      <app-empty-state *ngIf="listLoad.showSurface && rows.length === 0 && !hasActiveFilters()" icon="event" titleKey="COMMON.NO_DATA"></app-empty-state>
      <div class="app-list-surface" [class.is-refreshing]="listLoad.refreshing" *ngIf="listLoad.showSurface && (rows.length > 0 || hasActiveFilters())">
        <div class="list-refresh-spinner" *ngIf="listLoad.refreshing"><mat-spinner diameter="32"></mat-spinner></div>
        <section class="list-stats"><article class="stat-pill"><span class="stat-label">{{ 'COMMON.ALL' | translate }}</span><strong>{{ totalElements }}</strong></article></section>
        <section class="app-card table-card">
          <div class="estate-table-toolbar">
            <label class="estate-search-inline"><span class="material-icons">search</span>
              <input [(ngModel)]="searchTerm" (ngModelChange)="onSearch()" [placeholder]="'NAV.APPOINTMENTS' | translate">
            </label>
            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>{{ 'COMMON.FILTER_STATUS' | translate }}</mat-label>
              <mat-select [(ngModel)]="statusFilter" (selectionChange)="onStatusChange()">
                <mat-option value="">{{ 'COMMON.ALL' | translate }}</mat-option>
                <mat-option *ngFor="let s of appointmentStatuses" [value]="s">{{ 'STATUS.' + s | translate }}</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
          <div class="app-table-wrap"><table class="app-data-table"><thead><tr>
            <th>#</th><th>{{ 'NAV.DOCTORS' | translate }}</th><th>{{ 'NAV.APPOINTMENTS' | translate }}</th><th>{{ 'COMMON.STATUS' | translate }}</th>
          </tr></thead><tbody>
            <tr *ngFor="let a of rows">
              <td>{{ a.appointmentNumber }}</td>
              <td>{{ a.doctorNameAr }}</td>
              <td>{{ a.appointmentDate | rmsDate:'date' }} {{ a.startTime }}</td>
              <td>{{ 'STATUS.' + a.status | translate }}</td>
            </tr>
          </tbody></table></div>
          <app-table-pager [length]="totalElements" [pageSize]="pageSize" [pageIndex]="pageIndex" (pageIndexChange)="onPageChange($event)"/>
        </section>
      </div>
    </div>
  `,
  styles: [`.filter-field { min-width: 160px; }`]
})
export class ClinicAppointmentsComponent implements OnInit {
  listLoad = new ListLoadController();
  rows: Appointment[] = [];
  pageIndex = 0;
  pageSize = DEFAULT_TABLE_PAGE_SIZE;
  totalElements = 0;
  searchTerm = '';
  statusFilter = '';
  readonly appointmentStatuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'REJECTED', 'RESCHEDULED'] as const;
  private searchTimer?: ReturnType<typeof setTimeout>;
  constructor(private readonly clinicAdmin: ClinicAdminService) {}
  ngOnInit(): void { this.load(); }
  load(): void {
    this.listLoad.begin();
    const params = withPageParams(this.pageIndex, this.pageSize, { q: this.searchTerm });
    if (this.statusFilter) params['status'] = this.statusFilter;
    this.clinicAdmin.getAppointments(params).subscribe({
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
  selector: 'app-clinic-patients',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, TranslateModule, PageHeaderComponent, EmptyStateComponent, TablePagerComponent, MatProgressSpinnerModule],
  template: `
    <div class="app-page">
      <app-page-header titleKey="NAV.PATIENTS"></app-page-header>
      <div *ngIf="listLoad.showInitialSpinner" class="loading-wrap"><mat-spinner diameter="40"></mat-spinner></div>
      <app-empty-state *ngIf="listLoad.showSurface && rows.length === 0 && !hasActiveFilters()" icon="groups" titleKey="COMMON.NO_DATA"></app-empty-state>
      <div class="app-list-surface" [class.is-refreshing]="listLoad.refreshing" *ngIf="listLoad.showSurface && (rows.length > 0 || hasActiveFilters())">
        <div class="list-refresh-spinner" *ngIf="listLoad.refreshing"><mat-spinner diameter="32"></mat-spinner></div>
        <section class="list-stats"><article class="stat-pill"><span class="stat-label">{{ 'COMMON.ALL' | translate }}</span><strong>{{ totalElements }}</strong></article></section>
        <section class="app-card table-card">
          <div class="estate-table-toolbar">
            <label class="estate-search-inline"><span class="material-icons">search</span>
              <input [(ngModel)]="searchTerm" (ngModelChange)="onSearch()" [placeholder]="'NAV.PATIENTS' | translate">
            </label>
          </div>
          <div class="app-table-wrap"><table class="app-data-table"><thead><tr>
            <th>{{ 'NAV.PATIENTS' | translate }}</th><th>{{ 'AUTH.EMAIL' | translate }}</th><th>{{ 'AUTH.PHONE' | translate }}</th>
          </tr></thead><tbody>
            <tr *ngFor="let p of rows">
              <td>{{ p.user?.fullNameAr || ('PATIENT.DOCTOR' | translate) + ' #' + p.id }}</td>
              <td>{{ p.user?.email }}</td><td>{{ p.user?.phone }}</td>
            </tr>
          </tbody></table></div>
          <app-table-pager [length]="totalElements" [pageSize]="pageSize" [pageIndex]="pageIndex" (pageIndexChange)="onPageChange($event)"/>
        </section>
      </div>
    </div>
  `
})
export class ClinicPatientsComponent implements OnInit {
  listLoad = new ListLoadController();
  rows: ClinicPatient[] = [];
  pageIndex = 0;
  pageSize = DEFAULT_TABLE_PAGE_SIZE;
  totalElements = 0;
  searchTerm = '';
  private searchTimer?: ReturnType<typeof setTimeout>;
  constructor(private readonly clinicAdmin: ClinicAdminService) {}
  ngOnInit(): void { this.load(); }
  load(): void {
    this.listLoad.begin();
    this.clinicAdmin.getPatients(withPageParams(this.pageIndex, this.pageSize, { q: this.searchTerm })).subscribe({
      next: (res) => { this.rows = res.content; this.totalElements = res.totalElements; this.listLoad.end(); },
      error: () => { this.rows = []; this.totalElements = 0; this.listLoad.end(); }
    });
  }
  onPageChange(i: number): void { this.pageIndex = i; this.load(); }
  onSearch(): void { clearTimeout(this.searchTimer); this.searchTimer = setTimeout(() => { this.pageIndex = 0; this.load(); }, 300); }
  hasActiveFilters(): boolean { return !!this.searchTerm?.trim(); }
}

@Component({
  selector: 'app-clinic-services',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, ReactiveFormsModule, TranslateModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatCheckboxModule, MatCardModule, PageHeaderComponent, EmptyStateComponent, TablePagerComponent, MatProgressSpinnerModule],
  template: `
    <div class="app-page">
      <app-page-header titleKey="NAV.SERVICES">
        <button mat-flat-button color="primary" type="button" (click)="openCreate()">
          <mat-icon>add</mat-icon> {{ 'CLINIC.ADD_SERVICE' | translate }}
        </button>
      </app-page-header>
      <div *ngIf="listLoad.showInitialSpinner" class="loading-wrap"><mat-spinner diameter="40"></mat-spinner></div>
      <app-empty-state *ngIf="listLoad.showSurface && rows.length === 0 && !hasActiveFilters()" icon="medical_services" titleKey="COMMON.NO_DATA"></app-empty-state>
      <div class="app-list-surface" [class.is-refreshing]="listLoad.refreshing" *ngIf="listLoad.showSurface && (rows.length > 0 || hasActiveFilters())">
        <div class="list-refresh-spinner" *ngIf="listLoad.refreshing"><mat-spinner diameter="32"></mat-spinner></div>
        <section class="list-stats"><article class="stat-pill"><span class="stat-label">{{ 'COMMON.ALL' | translate }}</span><strong>{{ totalElements }}</strong></article></section>
        <section class="app-card table-card">
          <div class="estate-table-toolbar">
            <label class="estate-search-inline"><span class="material-icons">search</span>
              <input [(ngModel)]="searchTerm" (ngModelChange)="onSearch()" [placeholder]="'NAV.SERVICES' | translate">
            </label>
          </div>
          <div class="app-table-wrap"><table class="app-data-table"><thead><tr>
            <th>{{ 'NAV.SERVICES' | translate }}</th><th>{{ 'COMMON.EGP' | translate }}</th>
          </tr></thead><tbody>
            <tr *ngFor="let s of rows"><td>{{ s.nameAr }}</td><td>{{ s.price }}</td></tr>
          </tbody></table></div>
          <app-table-pager [length]="totalElements" [pageSize]="pageSize" [pageIndex]="pageIndex" (pageIndexChange)="onPageChange($event)"/>
        </section>
      </div>
      <div class="dialog-backdrop" *ngIf="showDialog" (click)="closeDialog()">
        <mat-card class="dialog-panel" (click)="$event.stopPropagation()">
          <h3>{{ 'CLINIC.ADD_SERVICE' | translate }}</h3>
          <form [formGroup]="serviceForm" (ngSubmit)="saveService()" class="dialog-form">
            <mat-form-field appearance="outline"><mat-label>{{ 'LOOKUPS.NAME_AR' | translate }}</mat-label><input matInput formControlName="nameAr"></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>{{ 'LOOKUPS.NAME_EN' | translate }}</mat-label><input matInput formControlName="nameEn"></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>{{ 'COMMON.EGP' | translate }}</mat-label><input matInput type="number" formControlName="price"></mat-form-field>
            <mat-checkbox formControlName="active">{{ 'ADMIN.ACTIVE' | translate }}</mat-checkbox>
            <div class="dialog-actions">
              <button mat-button type="button" (click)="closeDialog()">{{ 'COMMON.CANCEL' | translate }}</button>
              <button mat-flat-button color="primary" type="submit" [disabled]="serviceForm.invalid || saving">{{ 'COMMON.SAVE' | translate }}</button>
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
export class ClinicServicesComponent implements OnInit {
  listLoad = new ListLoadController();
  rows: ClinicServiceItem[] = [];
  pageIndex = 0;
  pageSize = DEFAULT_TABLE_PAGE_SIZE;
  totalElements = 0;
  searchTerm = '';
  showDialog = false;
  saving = false;
  serviceForm: FormGroup;
  private searchTimer?: ReturnType<typeof setTimeout>;
  constructor(
    fb: FormBuilder,
    private readonly clinicAdmin: ClinicAdminService,
    private readonly snack: SnackService,
    private readonly i18n: I18nService
  ) {
    this.serviceForm = fb.group({ nameAr: ['', Validators.required], nameEn: [''], price: [0, Validators.required], active: [true] });
  }
  ngOnInit(): void { this.load(); }
  load(): void {
    this.listLoad.begin();
    this.clinicAdmin.getServices(withPageParams(this.pageIndex, this.pageSize, { q: this.searchTerm })).subscribe({
      next: (res) => { this.rows = res.content; this.totalElements = res.totalElements; this.listLoad.end(); },
      error: () => { this.rows = []; this.totalElements = 0; this.listLoad.end(); }
    });
  }
  openCreate(): void { this.serviceForm.reset({ nameAr: '', nameEn: '', price: 0, active: true }); this.showDialog = true; }
  closeDialog(): void { this.showDialog = false; }
  saveService(): void {
    if (this.serviceForm.invalid || this.saving) return;
    this.saving = true;
    this.clinicAdmin.saveService(this.serviceForm.getRawValue()).subscribe({
      next: () => {
        this.snack.success(this.i18n.instant('COMMON.SAVE'));
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
  selector: 'app-clinic-specialties',
  standalone: true,
  imports: [NgFor, NgIf, TranslateModule, PageHeaderComponent, EmptyStateComponent, MatProgressSpinnerModule],
  template: `
    <div class="app-page">
      <app-page-header titleKey="NAV.SPECIALTIES" subtitleKey="CLINIC.SPECIALTIES_READONLY_HINT"></app-page-header>
      <div *ngIf="listLoad.showInitialSpinner" class="loading-wrap"><mat-spinner diameter="40"></mat-spinner></div>
      <app-empty-state *ngIf="listLoad.showSurface && rows.length === 0" icon="category" titleKey="COMMON.NO_DATA"></app-empty-state>
      <div class="app-list-surface" *ngIf="listLoad.showSurface && rows.length > 0">
        <section class="list-stats"><article class="stat-pill"><span class="stat-label">{{ 'COMMON.ALL' | translate }}</span><strong>{{ rows.length }}</strong></article></section>
        <section class="app-card table-card">
          <div class="app-table-wrap"><table class="app-data-table"><thead><tr>
            <th>{{ 'LOOKUPS.NAME_AR' | translate }}</th><th>{{ 'LOOKUPS.NAME_EN' | translate }}</th><th>{{ 'COMMON.STATUS' | translate }}</th>
          </tr></thead><tbody>
            <tr *ngFor="let s of rows">
              <td>{{ s.nameAr }}</td><td>{{ s.nameEn }}</td>
              <td>{{ s.active ? ('ADMIN.ACTIVE' | translate) : ('ADMIN.INACTIVE' | translate) }}</td>
            </tr>
          </tbody></table></div>
        </section>
      </div>
    </div>
  `
})
export class ClinicSpecialtiesComponent implements OnInit {
  listLoad = new ListLoadController();
  rows: ClinicSpecialty[] = [];
  constructor(private readonly clinicAdmin: ClinicAdminService) {}
  ngOnInit(): void {
    this.listLoad.begin();
    this.clinicAdmin.getSpecialties().subscribe({
      next: (items) => { this.rows = items; this.listLoad.end(); },
      error: () => { this.rows = []; this.listLoad.end(); }
    });
  }
}

@Component({
  selector: 'app-clinic-lab-results',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, ReactiveFormsModule, TranslateModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatCardModule, RmsDatePipe, PageHeaderComponent, EmptyStateComponent, TablePagerComponent, MatProgressSpinnerModule],
  template: `
    <div class="app-page">
      <app-page-header titleKey="NAV.LAB_RESULTS">
        <button mat-flat-button color="primary" type="button" (click)="showForm = !showForm">
          <mat-icon>add</mat-icon> {{ 'CLINIC.ADD_LAB_RESULT' | translate }}
        </button>
      </app-page-header>
      <mat-card class="create-card" *ngIf="showForm">
        <form [formGroup]="labForm" (ngSubmit)="submitLabResult()" class="create-form">
          <mat-form-field appearance="outline"><mat-label>{{ 'CLINIC.PATIENT_ID' | translate }}</mat-label><input matInput type="number" formControlName="patientId"></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>{{ 'CLINIC.TEST_NAME_AR' | translate }}</mat-label><input matInput formControlName="testNameAr"></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>{{ 'CLINIC.TEST_NAME_EN' | translate }}</mat-label><input matInput formControlName="testNameEn"></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>{{ 'CLINIC.RESULT_SUMMARY' | translate }}</mat-label><input matInput formControlName="resultSummary"></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>{{ 'CLINIC.RESULT_DATE' | translate }}</mat-label><input matInput type="date" formControlName="resultDate"></mat-form-field>
          <div class="create-actions">
            <button mat-button type="button" (click)="showForm = false">{{ 'COMMON.CANCEL' | translate }}</button>
            <button mat-flat-button color="primary" type="submit" [disabled]="labForm.invalid || saving">{{ 'COMMON.SAVE' | translate }}</button>
          </div>
        </form>
      </mat-card>
      <div *ngIf="listLoad.showInitialSpinner" class="loading-wrap"><mat-spinner diameter="40"></mat-spinner></div>
      <app-empty-state *ngIf="listLoad.showSurface && rows.length === 0 && !hasActiveFilters()" icon="science" titleKey="COMMON.NO_DATA"></app-empty-state>
      <div class="app-list-surface" [class.is-refreshing]="listLoad.refreshing" *ngIf="listLoad.showSurface && (rows.length > 0 || hasActiveFilters())">
        <div class="list-refresh-spinner" *ngIf="listLoad.refreshing"><mat-spinner diameter="32"></mat-spinner></div>
        <section class="list-stats"><article class="stat-pill"><span class="stat-label">{{ 'COMMON.ALL' | translate }}</span><strong>{{ totalElements }}</strong></article></section>
        <section class="app-card table-card">
          <div class="estate-table-toolbar">
            <label class="estate-search-inline"><span class="material-icons">search</span>
              <input [(ngModel)]="searchTerm" (ngModelChange)="onSearch()" [placeholder]="'NAV.LAB_RESULTS' | translate">
            </label>
          </div>
          <div class="app-table-wrap"><table class="app-data-table"><thead><tr>
            <th>{{ 'NAV.LAB_RESULTS' | translate }}</th><th>{{ 'COMMON.STATUS' | translate }}</th><th>{{ 'COMMON.ALL' | translate }}</th>
          </tr></thead><tbody>
            <tr *ngFor="let r of rows">
              <td>{{ r.testNameAr }}</td><td>{{ r.resultSummary || '-' }}</td><td>{{ r.resultDate | rmsDate:'date' }}</td>
            </tr>
          </tbody></table></div>
          <app-table-pager [length]="totalElements" [pageSize]="pageSize" [pageIndex]="pageIndex" (pageIndexChange)="onPageChange($event)"/>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .create-card { padding: 1rem; margin-bottom: 1rem; }
    .create-form { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.5rem; align-items: start; }
    .create-actions { grid-column: 1 / -1; display: flex; justify-content: flex-end; gap: 0.5rem; }
  `]
})
export class ClinicLabResultsComponent implements OnInit {
  listLoad = new ListLoadController();
  rows: ClinicLabResult[] = [];
  pageIndex = 0;
  pageSize = DEFAULT_TABLE_PAGE_SIZE;
  totalElements = 0;
  searchTerm = '';
  showForm = false;
  saving = false;
  labForm: FormGroup;
  private searchTimer?: ReturnType<typeof setTimeout>;
  constructor(
    fb: FormBuilder,
    private readonly clinicAdmin: ClinicAdminService,
    private readonly snack: SnackService,
    private readonly i18n: I18nService
  ) {
    this.labForm = fb.group({
      patientId: [null, Validators.required],
      testNameAr: ['', Validators.required],
      testNameEn: [''],
      resultSummary: [''],
      resultDate: ['', Validators.required]
    });
  }
  ngOnInit(): void { this.load(); }
  load(): void {
    this.listLoad.begin();
    this.clinicAdmin.getLabResults(withPageParams(this.pageIndex, this.pageSize, { q: this.searchTerm })).subscribe({
      next: (res) => { this.rows = res.content; this.totalElements = res.totalElements; this.listLoad.end(); },
      error: () => { this.rows = []; this.totalElements = 0; this.listLoad.end(); }
    });
  }
  submitLabResult(): void {
    if (this.labForm.invalid || this.saving) return;
    this.saving = true;
    const value = this.labForm.getRawValue();
    this.clinicAdmin.createLabResult({
      patientId: Number(value.patientId),
      testNameAr: value.testNameAr,
      testNameEn: value.testNameEn,
      resultSummary: value.resultSummary,
      resultDate: value.resultDate
    }).subscribe({
      next: () => {
        this.snack.success(this.i18n.instant('COMMON.SAVE'));
        this.saving = false;
        this.showForm = false;
        this.labForm.reset();
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
  selector: 'app-clinic-analytics',
  standalone: true,
  imports: [TranslateModule, MatCardModule, PageHeaderComponent, NgIf, MatProgressSpinnerModule],
  template: `
    <app-page-header titleKey="NAV.ANALYTICS"></app-page-header>
    <div *ngIf="loading" class="loading-wrap"><mat-spinner diameter="40"></mat-spinner></div>
    <div class="stats-grid" *ngIf="!loading && analytics">
      <mat-card class="stat"><h2>{{ analytics.doctorCount }}</h2><p>{{ 'CLINIC.ACTIVE_DOCTORS' | translate }}</p></mat-card>
      <mat-card class="stat"><h2>{{ analytics.branchCount }}</h2><p>{{ 'CLINIC.BRANCHES' | translate }}</p></mat-card>
      <mat-card class="stat"><h2>{{ analytics.appointmentCount }}</h2><p>{{ 'CLINIC.MONTH_APPOINTMENTS' | translate }}</p></mat-card>
    </div>
  `,
  styles: [`.stats-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:1rem; } .stat { padding:1.5rem; text-align:center; } h2 { color:var(--tb-primary); margin:0; font-size:2rem; }`]
})
export class ClinicAnalyticsComponent implements OnInit {
  loading = true;
  analytics: ClinicAnalytics | null = null;
  constructor(private readonly clinicAdmin: ClinicAdminService) {}
  ngOnInit(): void {
    this.clinicAdmin.getAnalytics().subscribe({
      next: (a) => { this.analytics = a; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
}
