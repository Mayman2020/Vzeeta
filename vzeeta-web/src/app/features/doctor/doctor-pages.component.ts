import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, SlicePipe } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { FeatureShellComponent } from '../../shared/components/feature-shell/feature-shell.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { TablePagerComponent } from '../../shared/components/table-pager/table-pager.component';
import { ListLoadController } from '../../shared/utils/list-load.util';
import { DEFAULT_TABLE_PAGE_SIZE, withPageParams } from '../../core/utils/pagination.util';
import { DoctorPortalService, DoctorAvailability } from '../../core/services/doctor-portal.service';
import { Appointment } from '../../core/models/appointment.model';
import { SnackService } from '../../core/services/snack.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { RmsDatePipe } from '../../shared/pipes/rms-date.pipe';

const DAY_NAMES = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const APPOINTMENT_STATUSES = ['PENDING', 'CONFIRMED', 'RESCHEDULED', 'COMPLETED', 'CANCELLED', 'REJECTED'] as const;

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [NgFor, NgIf, SlicePipe, TranslateModule, MatProgressSpinnerModule, MatButtonModule, MatIconModule],
  template: `
    <div class="app-page dashboard-page">
      <div *ngIf="loading" class="loading-center"><mat-spinner diameter="40"></mat-spinner></div>
      <ng-container *ngIf="!loading">
        <div class="estate-stat-grid">
          <article class="estate-stat-card navy">
            <div class="estate-stat-top">
              <span class="estate-stat-label">{{ 'DOCTOR.TODAY_APPOINTMENTS' | translate }}</span>
              <div class="estate-stat-icon"><span class="material-icons">today</span></div>
            </div>
            <div class="estate-stat-value">{{ todayCount }}</div>
            <div class="estate-stat-foot">
              <span class="material-icons kpi-nav-arrow">schedule</span>
              <span>{{ 'COMMON.TODAY' | translate }}</span>
            </div>
          </article>

          <article class="estate-stat-card teal">
            <div class="estate-stat-top">
              <span class="estate-stat-label">{{ 'DOCTOR.WEEK_APPOINTMENTS' | translate }}</span>
              <div class="estate-stat-icon"><span class="material-icons">event_note</span></div>
            </div>
            <div class="estate-stat-value">{{ totalCount }}</div>
            <div class="estate-stat-foot">
              <span>{{ 'APPOINTMENT.ALL' | translate }}</span>
            </div>
          </article>

          <article class="estate-stat-card gold">
            <div class="estate-stat-top">
              <span class="estate-stat-label">{{ 'DOCTOR.MONTH_EARNINGS' | translate }}</span>
              <div class="estate-stat-icon"><span class="material-icons">payments</span></div>
            </div>
            <div class="estate-stat-value">{{ totalEarnings }}</div>
            <div class="estate-stat-foot">
              <span>{{ 'COMMON.EGP' | translate }}</span>
            </div>
          </article>

          <article class="estate-stat-card danger">
            <div class="estate-stat-top">
              <span class="estate-stat-label">{{ 'DOCTOR.PENDING_REQUESTS' | translate }}</span>
              <div class="estate-stat-icon"><span class="material-icons">pending_actions</span></div>
            </div>
            <div class="estate-stat-value">{{ pendingCount }}</div>
            <div class="estate-stat-foot">
              <span>{{ 'APPOINTMENT.STATUS_PENDING' | translate }}</span>
            </div>
          </article>
        </div>

        <!-- Today's Appointments -->
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
export class DoctorDashboardComponent implements OnInit {
  loading = true;
  todayCount = 0;
  totalCount = 0;
  pendingCount = 0;
  totalEarnings = 0;
  todayAppointments: Appointment[] = [];

  private readonly AVATAR_COLORS = ['#2563eb','#db2777','#059669','#ea580c','#7c3aed','#0284c7'];

  constructor(private readonly doctorPortal: DoctorPortalService) {}

  ngOnInit(): void {
    const today = new Date().toISOString().split('T')[0];
    this.doctorPortal.getAppointments(withPageParams(0, 100)).subscribe({
      next: (res) => {
        const appts = res.content;
        this.totalCount = res.totalElements;
        this.todayAppointments = appts.filter(a => a.appointmentDate === today);
        this.todayCount = this.todayAppointments.length;
        this.pendingCount = appts.filter(a => a.status === 'PENDING').length;
        this.doctorPortal.getEarnings().subscribe({
          next: (e) => { this.totalEarnings = e.totalEarnings; this.loading = false; },
          error: () => { this.loading = false; }
        });
      },
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
  selector: 'app-doctor-calendar',
  standalone: true,
  imports: [
    NgFor, NgIf, ReactiveFormsModule, TranslateModule, MatCardModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatCheckboxModule,
    PageHeaderComponent, MatProgressSpinnerModule, MatIconModule
  ],
  template: `
    <div class="cal-page">
      <!-- Header -->
      <div class="cal-header">
        <div>
          <h1 class="cal-title">{{ 'NAV.CALENDAR' | translate }}</h1>
          <p class="cal-sub">{{ 'DOCTOR.SCHEDULE_SUBTITLE' | translate }}</p>
        </div>
        <button class="add-slot-btn" type="button" (click)="showForm = !showForm">
          <span class="material-icons">{{ showForm ? 'close' : 'add' }}</span>
          {{ (showForm ? 'COMMON.CANCEL' : 'DOCTOR.ADD_AVAILABILITY') | translate }}
        </button>
      </div>

      <!-- Add Slot Form -->
      <div class="slot-form-card" *ngIf="showForm">
        <h3 class="form-title">
          <span class="material-icons">event_available</span>
          {{ 'DOCTOR.ADD_AVAILABILITY' | translate }}
        </h3>
        <form [formGroup]="slotForm" (ngSubmit)="saveSlot()" class="slot-form">
          <div class="form-row">
            <div class="form-field">
              <label>{{ 'DOCTOR.DAY' | translate }}</label>
              <select formControlName="dayOfWeek" class="sf-select">
                <option *ngFor="let d of dayOptions" [value]="d.value">{{ d.label }}</option>
              </select>
            </div>
            <div class="form-field">
              <label>{{ 'DOCTOR.START_TIME' | translate }}</label>
              <input type="time" formControlName="startTime" class="sf-input">
            </div>
            <div class="form-field">
              <label>{{ 'DOCTOR.END_TIME' | translate }}</label>
              <input type="time" formControlName="endTime" class="sf-input">
            </div>
            <div class="form-field">
              <label>{{ 'DOCTOR.MIN_PER_SLOT' | translate }}</label>
              <input type="number" formControlName="slotMinutes" min="5" class="sf-input">
            </div>
          </div>
          <div class="form-footer">
            <label class="online-toggle">
              <input type="checkbox" formControlName="onlineOnly">
              <span class="material-icons">videocam</span>
              {{ 'SEARCH.ONLINE' | translate }}
            </label>
            <button class="save-slot-btn" type="submit" [disabled]="slotForm.invalid || saving">
              <span class="material-icons">save</span>
              {{ 'COMMON.SAVE' | translate }}
            </button>
          </div>
        </form>
      </div>

      <!-- Loading -->
      <div class="cal-loading" *ngIf="loading">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <!-- Weekly Grid -->
      <div class="weekly-grid" *ngIf="!loading">
        <div class="day-column" *ngFor="let day of dayOptions">
          <div class="day-header" [class.has-slots]="slotsForDay(day.value).length > 0">
            <span class="day-label">{{ day.label }}</span>
            <span class="day-count" *ngIf="slotsForDay(day.value).length > 0">
              {{ slotsForDay(day.value).length }}
            </span>
          </div>
          <div class="day-body">
            <div class="slot-block" *ngFor="let s of slotsForDay(day.value)" [class.online]="s.onlineOnly">
              <div class="slot-time">{{ formatTime(s.startTime) }} — {{ formatTime(s.endTime) }}</div>
              <div class="slot-meta">
                <span class="slot-type">
                  <span class="material-icons">{{ s.onlineOnly ? 'videocam' : 'local_hospital' }}</span>
                  {{ s.onlineOnly ? ('SEARCH.ONLINE' | translate) : ('SEARCH.IN_CLINIC' | translate) }}
                </span>
                <span class="slot-duration">{{ s.slotMinutes }}m</span>
              </div>
            </div>
            <div class="day-empty" *ngIf="slotsForDay(day.value).length === 0">
              <span class="material-icons">block</span>
              <span>{{ 'DOCTOR.OFF' | translate }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cal-page { padding: 24px; }
    .cal-header { display:flex; justify-content:space-between; align-items:flex-start; gap:16px; margin-bottom:24px; flex-wrap:wrap; }
    .cal-title { margin:0 0 4px; font-size:1.5rem; font-weight:900; color:#0f172a; }
    .cal-sub { margin:0; color:#64748b; font-size:0.88rem; }
    .add-slot-btn { display:flex; align-items:center; gap:6px; padding:10px 18px; border-radius:10px; background:linear-gradient(135deg,#2563eb,#1d4ed8); border:none; color:#fff; font:inherit; font-weight:700; font-size:0.88rem; cursor:pointer; .material-icons{font-size:18px;} }

    .slot-form-card { background:#fff; border:1px solid #e2e8f0; border-radius:14px; padding:20px; margin-bottom:24px; }
    .form-title { display:flex; align-items:center; gap:8px; margin:0 0 18px; font-size:0.95rem; font-weight:800; color:#0f172a; .material-icons{font-size:20px; color:#2563eb;} }
    .slot-form { display:flex; flex-direction:column; gap:14px; }
    .form-row { display:grid; grid-template-columns:repeat(auto-fit, minmax(140px, 1fr)); gap:12px; }
    .form-field { display:flex; flex-direction:column; gap:5px; label{font-size:0.8rem; font-weight:600; color:#475569;} }
    .sf-select, .sf-input { padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:8px; font:inherit; font-size:0.88rem; color:#0f172a; width:100%; box-sizing:border-box; &:focus{outline:none; border-color:#2563eb;} }
    .form-footer { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; }
    .online-toggle { display:flex; align-items:center; gap:6px; cursor:pointer; color:#475569; font-size:0.85rem; font-weight:600; input{accent-color:#2563eb;} .material-icons{font-size:18px; color:#2563eb;} }
    .save-slot-btn { display:flex; align-items:center; gap:6px; padding:10px 22px; border:none; border-radius:10px; background:linear-gradient(135deg,#16a34a,#15803d); color:#fff; font:inherit; font-weight:700; cursor:pointer; .material-icons{font-size:18px;} &:disabled{opacity:0.5; cursor:not-allowed;} }

    .cal-loading { display:flex; justify-content:center; padding:48px; }

    /* Weekly grid */
    .weekly-grid { display:grid; grid-template-columns:repeat(7,1fr); gap:8px; }
    .day-column { background:#fff; border:1px solid #e2e8f0; border-radius:12px; overflow:hidden; min-height:200px; }
    .day-header { background:#f8fafc; padding:10px 12px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #e2e8f0;
      &.has-slots { background:linear-gradient(135deg,#eff6ff,#dbeafe); border-bottom-color:#bfdbfe; } }
    .day-label { font-size:0.78rem; font-weight:800; color:#475569; }
    .day-count { width:20px; height:20px; border-radius:50%; background:#2563eb; color:#fff; font-size:0.7rem; font-weight:800; display:grid; place-items:center; }
    .day-body { padding:8px; display:flex; flex-direction:column; gap:6px; }
    .slot-block { background:#eff6ff; border:1px solid #bfdbfe; border-radius:8px; padding:8px; cursor:pointer; transition:box-shadow 0.15s;
      &.online { background:#d1fae5; border-color:#a7f3d0; }
      &:hover { box-shadow:0 2px 8px rgba(37,99,235,0.15); } }
    .slot-time { font-size:0.76rem; font-weight:800; color:#0f172a; margin-bottom:5px; }
    .slot-meta { display:flex; align-items:center; justify-content:space-between; }
    .slot-type { display:flex; align-items:center; gap:3px; font-size:0.68rem; color:#64748b; .material-icons{font-size:12px;} }
    .slot-duration { font-size:0.68rem; font-weight:700; color:#94a3b8; background:#fff; padding:1px 5px; border-radius:4px; }
    .day-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; padding:20px 8px; color:#cbd5e1; text-align:center;
      .material-icons{font-size:20px;} span:last-child{font-size:0.72rem;} }
    @media (max-width: 900px) { .weekly-grid { grid-template-columns: repeat(4, 1fr); } }
    @media (max-width: 560px) { .weekly-grid { grid-template-columns: repeat(2, 1fr); } }
  `]
})
export class DoctorCalendarComponent implements OnInit {
  slots: DoctorAvailability[] = [];
  loading = true;
  saving = false;
  showForm = false;
  dayOptions = DAY_NAMES.map((label, value) => ({ value, label }));
  slotForm: FormGroup;

  constructor(
    fb: FormBuilder,
    private readonly doctorPortal: DoctorPortalService,
    private readonly snack: SnackService,
    private readonly i18n: I18nService
  ) {
    this.slotForm = fb.group({
      dayOfWeek: [0, Validators.required],
      startTime: ['09:00', Validators.required],
      endTime: ['17:00', Validators.required],
      slotMinutes: [30, [Validators.required, Validators.min(5)]],
      onlineOnly: [false]
    });
  }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.doctorPortal.getAvailability().subscribe({
      next: (s) => { this.slots = s; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  saveSlot(): void {
    if (this.slotForm.invalid) return;
    this.saving = true;
    const v = this.slotForm.value;
    this.doctorPortal.saveAvailability({
      dayOfWeek: v.dayOfWeek,
      startTime: v.startTime,
      endTime: v.endTime,
      slotMinutes: v.slotMinutes,
      onlineOnly: !!v.onlineOnly
    }).subscribe({
      next: () => {
        this.snack.success(this.i18n.instant('DOCTOR.AVAILABILITY_SAVED'));
        this.saving = false;
        this.showForm = false;
        this.load();
      },
      error: () => { this.saving = false; }
    });
  }

  slotsForDay(dayOfWeek: number): DoctorAvailability[] {
    return this.slots.filter(s => s.dayOfWeek === dayOfWeek);
  }

  dayName(d: number): string { return DAY_NAMES[d] ?? `${d}`; }
  formatTime(t: string): string { return (t ?? '').substring(0, 5); }
}

@Component({
  selector: 'app-doctor-appointments',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, TranslateModule, MatButtonModule, MatChipsModule, RmsDatePipe, PageHeaderComponent, EmptyStateComponent, TablePagerComponent, MatProgressSpinnerModule],
  template: `
    <div class="app-page">
      <app-page-header titleKey="NAV.APPOINTMENTS"></app-page-header>
      <div *ngIf="listLoad.showInitialSpinner" class="loading-wrap"><mat-spinner diameter="40"></mat-spinner></div>
      <app-empty-state *ngIf="listLoad.showSurface && rows.length === 0 && !hasActiveFilters()" icon="event" titleKey="DOCTOR.NO_APPOINTMENTS"></app-empty-state>
      <div class="app-list-surface" [class.is-refreshing]="listLoad.refreshing" *ngIf="listLoad.showSurface && (rows.length > 0 || hasActiveFilters())">
        <div class="list-refresh-spinner" *ngIf="listLoad.refreshing"><mat-spinner diameter="32"></mat-spinner></div>
        <section class="list-stats"><article class="stat-pill"><span class="stat-label">{{ 'COMMON.ALL' | translate }}</span><strong>{{ totalElements }}</strong></article></section>
        <section class="app-card table-card">
          <div class="estate-table-toolbar">
            <label class="estate-search-inline"><span class="material-icons">search</span>
              <input [(ngModel)]="searchTerm" (ngModelChange)="onSearch()" [placeholder]="'NAV.APPOINTMENTS' | translate">
            </label>
            <select class="status-filter" [(ngModel)]="statusFilter" (ngModelChange)="onFilterChange()">
              <option value="">{{ 'COMMON.ALL' | translate }}</option>
              <option *ngFor="let s of statusOptions" [value]="s">{{ 'STATUS.' + s | translate }}</option>
            </select>
          </div>
          <div class="app-table-wrap"><table class="app-data-table"><thead><tr>
            <th>#</th><th>{{ 'NAV.APPOINTMENTS' | translate }}</th><th>{{ 'COMMON.STATUS' | translate }}</th><th>{{ 'COMMON.ACTIONS' | translate }}</th>
          </tr></thead><tbody>
            <tr *ngFor="let a of rows">
              <td>{{ a.appointmentNumber }}</td>
              <td>{{ a.appointmentDate | rmsDate:'date' }} {{ a.startTime }}</td>
              <td><mat-chip>{{ 'STATUS.' + a.status | translate }}</mat-chip></td>
              <td class="actions" *ngIf="a.status === 'PENDING'">
                <button mat-flat-button color="primary" (click)="accept(a)">{{ 'DOCTOR.ACCEPT' | translate }}</button>
                <button mat-stroked-button color="warn" (click)="reject(a)">{{ 'DOCTOR.REJECT' | translate }}</button>
              </td>
              <td *ngIf="a.status !== 'PENDING'">—</td>
            </tr>
          </tbody></table></div>
          <app-table-pager [length]="totalElements" [pageSize]="pageSize" [pageIndex]="pageIndex" (pageIndexChange)="onPageChange($event)"/>
        </section>
      </div>
    </div>
  `,
  styles: [`.actions { display:flex; gap:0.5rem; flex-wrap:wrap; } .status-filter { min-width:140px; padding:0.5rem; border-radius:8px; border:1px solid var(--tb-border); }`]
})
export class DoctorAppointmentsComponent implements OnInit {
  listLoad = new ListLoadController();
  rows: Appointment[] = [];
  pageIndex = 0;
  pageSize = DEFAULT_TABLE_PAGE_SIZE;
  totalElements = 0;
  searchTerm = '';
  statusFilter = '';
  statusOptions = APPOINTMENT_STATUSES;
  private searchTimer?: ReturnType<typeof setTimeout>;
  constructor(
    private readonly doctorPortal: DoctorPortalService,
    private readonly snack: SnackService,
    private readonly i18n: I18nService
  ) {}
  ngOnInit(): void { this.load(); }
  load(): void {
    this.listLoad.begin();
    this.doctorPortal.getAppointments(withPageParams(this.pageIndex, this.pageSize, {
      q: this.searchTerm,
      status: this.statusFilter
    })).subscribe({
      next: (res) => { this.rows = res.content; this.totalElements = res.totalElements; this.listLoad.end(); },
      error: () => { this.rows = []; this.totalElements = 0; this.listLoad.end(); }
    });
  }
  onPageChange(i: number): void { this.pageIndex = i; this.load(); }
  onSearch(): void {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => { this.pageIndex = 0; this.load(); }, 300);
  }
  onFilterChange(): void { this.pageIndex = 0; this.load(); }
  hasActiveFilters(): boolean { return !!this.searchTerm?.trim() || !!this.statusFilter; }
  accept(a: Appointment): void {
    this.doctorPortal.acceptAppointment(a.id).subscribe({
      next: () => { this.snack.success(this.i18n.instant('DOCTOR.ACCEPTED')); this.load(); }
    });
  }
  reject(a: Appointment): void {
    this.doctorPortal.rejectAppointment(a.id).subscribe({
      next: () => { this.snack.success(this.i18n.instant('DOCTOR.REJECTED')); this.load(); }
    });
  }
}

@Component({
  selector: 'app-doctor-prescriptions',
  standalone: true,
  imports: [
    NgFor, NgIf, ReactiveFormsModule, RmsDatePipe, TranslateModule, MatButtonModule, MatCardModule,
    MatFormFieldModule, MatInputModule, PageHeaderComponent, EmptyStateComponent, TablePagerComponent, MatProgressSpinnerModule
  ],
  template: `
    <div class="app-page">
      <app-page-header titleKey="NAV.PRESCRIPTIONS">
        <button mat-flat-button color="primary" type="button" (click)="showForm = !showForm">
          {{ (showForm ? 'COMMON.CANCEL' : 'DOCTOR.NEW_PRESCRIPTION') | translate }}
        </button>
      </app-page-header>
      <mat-card class="form-card" *ngIf="showForm">
        <form [formGroup]="rxForm" (ngSubmit)="submitPrescription()">
          <mat-form-field appearance="outline">
            <mat-label>{{ 'DOCTOR.APPOINTMENT_ID' | translate }}</mat-label>
            <input matInput type="number" formControlName="appointmentId">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>{{ 'DOCTOR.PATIENT_ID' | translate }}</mat-label>
            <input matInput type="number" formControlName="patientId">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>{{ 'DOCTOR.DIAGNOSIS' | translate }}</mat-label>
            <input matInput formControlName="diagnosisAr">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>{{ 'DOCTOR.MEDICINE' | translate }}</mat-label>
            <input matInput formControlName="medicineName">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>{{ 'DOCTOR.DOSAGE' | translate }}</mat-label>
            <input matInput formControlName="dosage">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>{{ 'BOOKING.NOTES' | translate }}</mat-label>
            <textarea matInput formControlName="notes" rows="2"></textarea>
          </mat-form-field>
          <button mat-flat-button color="primary" type="submit" [disabled]="rxForm.invalid || saving">{{ 'COMMON.SAVE' | translate }}</button>
        </form>
      </mat-card>
      <div *ngIf="listLoad.showInitialSpinner" class="loading-wrap"><mat-spinner diameter="40"></mat-spinner></div>
      <app-empty-state *ngIf="listLoad.showSurface && rows.length === 0 && !showForm" icon="medication" titleKey="PATIENT.NO_PRESCRIPTIONS"></app-empty-state>
      <div class="app-list-surface" *ngIf="listLoad.showSurface && rows.length > 0">
        <section class="list-stats"><article class="stat-pill"><span class="stat-label">{{ 'COMMON.ALL' | translate }}</span><strong>{{ totalElements }}</strong></article></section>
        <section class="app-card table-card">
          <div class="app-table-wrap"><table class="app-data-table"><thead><tr>
            <th>{{ 'NAV.PRESCRIPTIONS' | translate }}</th><th>{{ 'COMMON.ALL' | translate }}</th>
          </tr></thead><tbody>
            <tr *ngFor="let p of rows">
              <td>{{ p['diagnosisAr'] || p['diagnosisEn'] }}</td>
              <td>{{ $any(p)['createdAt'] | rmsDate:'datetime' }}</td>
            </tr>
          </tbody></table></div>
          <app-table-pager [length]="totalElements" [pageSize]="pageSize" [pageIndex]="pageIndex" (pageIndexChange)="onPageChange($event)"/>
        </section>
      </div>
    </div>
  `,
  styles: [`.form-card { padding:1rem; margin-bottom:1rem; } form { display:flex; flex-direction:column; gap:0.5rem; }`]
})
export class DoctorPrescriptionsComponent implements OnInit {
  listLoad = new ListLoadController();
  rows: Record<string, unknown>[] = [];
  pageIndex = 0;
  pageSize = DEFAULT_TABLE_PAGE_SIZE;
  totalElements = 0;
  showForm = false;
  saving = false;
  rxForm: FormGroup;

  constructor(
    fb: FormBuilder,
    private readonly doctorPortal: DoctorPortalService,
    private readonly snack: SnackService,
    private readonly i18n: I18nService
  ) {
    this.rxForm = fb.group({
      appointmentId: [null, Validators.required],
      patientId: [null, Validators.required],
      diagnosisAr: ['', Validators.required],
      medicineName: ['', Validators.required],
      dosage: [''],
      notes: ['']
    });
  }

  ngOnInit(): void { this.load(); }
  load(): void {
    this.listLoad.begin();
    this.doctorPortal.getPrescriptions(withPageParams(this.pageIndex, this.pageSize)).subscribe({
      next: (res) => { this.rows = res.content; this.totalElements = res.totalElements; this.listLoad.end(); },
      error: () => { this.rows = []; this.totalElements = 0; this.listLoad.end(); }
    });
  }
  onPageChange(i: number): void { this.pageIndex = i; this.load(); }

  submitPrescription(): void {
    if (this.rxForm.invalid) return;
    this.saving = true;
    const v = this.rxForm.value;
    this.doctorPortal.createPrescription({
      appointmentId: Number(v.appointmentId),
      patientId: Number(v.patientId),
      diagnosisAr: v.diagnosisAr,
      notes: v.notes,
      items: [{ medicineName: v.medicineName, dosage: v.dosage }]
    }).subscribe({
      next: () => {
        this.snack.success(this.i18n.instant('DOCTOR.PRESCRIPTION_SAVED'));
        this.saving = false;
        this.showForm = false;
        this.rxForm.reset();
        this.load();
      },
      error: () => { this.saving = false; }
    });
  }
}

@Component({
  selector: 'app-doctor-earnings',
  standalone: true,
  imports: [TranslateModule, MatCardModule, PageHeaderComponent, NgIf, MatProgressSpinnerModule],
  template: `
    <app-page-header titleKey="NAV.EARNINGS"></app-page-header>
    <div *ngIf="loading" class="loading-wrap"><mat-spinner diameter="40"></mat-spinner></div>
    <mat-card *ngIf="!loading" class="earnings-card">
      <h2>{{ earnings.totalEarnings }} {{ 'COMMON.EGP' | translate }}</h2>
      <p>{{ 'DOCTOR.PAYMENT_COUNT' | translate }}: {{ earnings.paymentCount }}</p>
    </mat-card>
  `,
  styles: [`.earnings-card { padding:2rem; text-align:center; } h2 { color:var(--tb-primary); font-size:2rem; }`]
})
export class DoctorEarningsComponent implements OnInit {
  loading = true;
  earnings = { totalEarnings: 0, paymentCount: 0 };
  constructor(private readonly doctorPortal: DoctorPortalService) {}
  ngOnInit(): void {
    this.doctorPortal.getEarnings().subscribe({
      next: (e) => { this.earnings = e; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
}
