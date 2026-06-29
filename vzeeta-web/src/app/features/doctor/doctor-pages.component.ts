import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
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
  imports: [NgFor, NgIf, TranslateModule, MatProgressSpinnerModule, MatButtonModule, MatIconModule],
  template: `
    <div class="med-dashboard">
      <div *ngIf="loading" class="loading-wrap"><mat-spinner diameter="40"></mat-spinner></div>
      <ng-container *ngIf="!loading">
        <div class="med-kpi-grid">
          <div class="med-kpi-card">
            <div class="med-kpi-body">
              <div class="med-kpi-text">
                <div class="med-kpi-label">{{ 'DOCTOR.TODAY_APPOINTMENTS' | translate }}</div>
                <div class="med-kpi-value">{{ todayCount }}</div>
                <div class="med-kpi-sub">{{ 'COMMON.TODAY' | translate }}</div>
              </div>
              <div class="med-kpi-ring blue">
                <svg viewBox="0 0 56 56" width="56" height="56">
                  <circle cx="28" cy="28" r="22" fill="none" stroke="#e2e8f0" stroke-width="5"/>
                  <circle cx="28" cy="28" r="22" fill="none" stroke="#2563eb" stroke-width="5"
                    stroke-dasharray="138.2" [attr.stroke-dashoffset]="ringOffset(todayCount, totalCount)" stroke-linecap="round" transform="rotate(-90 28 28)"/>
                  <text x="28" y="32" text-anchor="middle" font-size="11" font-weight="700" fill="#1e293b">{{ todayCount }}</text>
                </svg>
              </div>
            </div>
            <div class="med-kpi-bar"><span class="med-badge blue">{{ 'DOCTOR.TODAY_APPOINTMENTS' | translate }}</span></div>
          </div>

          <div class="med-kpi-card">
            <div class="med-kpi-body">
              <div class="med-kpi-text">
                <div class="med-kpi-label">{{ 'DOCTOR.WEEK_APPOINTMENTS' | translate }}</div>
                <div class="med-kpi-value">{{ totalCount }}</div>
                <div class="med-kpi-sub">{{ 'COMMON.TOTAL' | translate }}</div>
              </div>
              <div class="med-kpi-ring rose">
                <svg viewBox="0 0 56 56" width="56" height="56">
                  <circle cx="28" cy="28" r="22" fill="none" stroke="#fce7f3" stroke-width="5"/>
                  <circle cx="28" cy="28" r="22" fill="none" stroke="#db2777" stroke-width="5"
                    stroke-dasharray="138.2" stroke-dashoffset="40" stroke-linecap="round" transform="rotate(-90 28 28)"/>
                  <text x="28" y="32" text-anchor="middle" font-size="11" font-weight="700" fill="#1e293b">{{ totalCount }}</text>
                </svg>
              </div>
            </div>
            <div class="med-kpi-bar"><span class="med-badge rose">{{ 'APPOINTMENT.ALL' | translate }}</span></div>
          </div>

          <div class="med-kpi-card">
            <div class="med-kpi-body">
              <div class="med-kpi-text">
                <div class="med-kpi-label">{{ 'DOCTOR.MONTH_EARNINGS' | translate }}</div>
                <div class="med-kpi-value">{{ totalEarnings }}</div>
                <div class="med-kpi-sub">{{ 'COMMON.EGP' | translate }}</div>
              </div>
              <div class="med-kpi-ring teal">
                <svg viewBox="0 0 56 56" width="56" height="56">
                  <circle cx="28" cy="28" r="22" fill="none" stroke="#d1fae5" stroke-width="5"/>
                  <circle cx="28" cy="28" r="22" fill="none" stroke="#059669" stroke-width="5"
                    stroke-dasharray="138.2" stroke-dashoffset="55" stroke-linecap="round" transform="rotate(-90 28 28)"/>
                  <text x="28" y="32" text-anchor="middle" font-size="9" font-weight="700" fill="#1e293b">EGP</text>
                </svg>
              </div>
            </div>
            <div class="med-kpi-bar"><span class="med-badge teal">{{ 'DOCTOR.EARNINGS' | translate }}</span></div>
          </div>

          <div class="med-kpi-card">
            <div class="med-kpi-body">
              <div class="med-kpi-text">
                <div class="med-kpi-label">{{ 'DOCTOR.PENDING_REQUESTS' | translate }}</div>
                <div class="med-kpi-value">{{ pendingCount }}</div>
                <div class="med-kpi-sub">{{ 'APPOINTMENT.STATUS_PENDING' | translate }}</div>
              </div>
              <div class="med-kpi-ring gold">
                <svg viewBox="0 0 56 56" width="56" height="56">
                  <circle cx="28" cy="28" r="22" fill="none" stroke="#fef9c3" stroke-width="5"/>
                  <circle cx="28" cy="28" r="22" fill="none" stroke="#ca8a04" stroke-width="5"
                    stroke-dasharray="138.2" [attr.stroke-dashoffset]="ringOffset(pendingCount, totalCount)" stroke-linecap="round" transform="rotate(-90 28 28)"/>
                  <text x="28" y="32" text-anchor="middle" font-size="11" font-weight="700" fill="#1e293b">{{ pendingCount }}</text>
                </svg>
              </div>
            </div>
            <div class="med-kpi-bar"><span class="med-badge gold">{{ 'APPOINTMENT.AWAITING' | translate }}</span></div>
          </div>
        </div>

        <!-- Today's Appointments List -->
        <div class="med-appts-section">
          <div class="med-appts-header">
            <h3 class="med-appts-title">{{ 'CLINIC.TODAY_APPOINTMENTS' | translate }} <span class="med-appts-count">({{ todayAppointments.length }})</span></h3>
          </div>
          <div class="med-appt-grid" *ngIf="todayAppointments.length > 0; else noAppts">
            <div class="med-appt-card" *ngFor="let a of todayAppointments">
              <div class="med-appt-card-top">
                <div class="med-appt-avatar" [style.background]="avatarColor(a.patientNameAr || a.patientNameEn || 'P')">
                  {{ initials(a.patientNameAr || a.patientNameEn) }}
                </div>
                <div class="med-appt-info">
                  <div class="med-appt-name">{{ a.patientNameAr || a.patientNameEn || ('PATIENT.PATIENT' | translate) + ' #' + a.patientId }}</div>
                  <div class="med-appt-type">{{ a.specialtyNameAr || a.consultationType }}</div>
                  <span class="status-badge" [attr.data-status]="a.status">{{ a.status }}</span>
                </div>
              </div>
              <div class="med-appt-time">{{ a.startTime | slice:0:5 }}</div>
              <div class="med-appt-date">{{ a.appointmentDate }}</div>
            </div>
          </div>
          <ng-template #noAppts>
            <div class="app-empty-state"><span class="material-icons empty-icon">event_available</span><h4>{{ 'APPOINTMENT.NO_TODAY' | translate }}</h4></div>
          </ng-template>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .med-dashboard { padding: 24px; min-height: calc(100vh - 64px); }
    .med-kpi-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 28px; }
    .med-kpi-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; box-shadow: 0 1px 4px rgba(15,23,42,.06); }
    .med-kpi-body { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
    .med-kpi-label { font-size: 13px; font-weight: 600; color: #64748b; margin-bottom: 4px; }
    .med-kpi-value { font-size: 38px; font-weight: 700; color: #0f172a; line-height: 1; }
    .med-kpi-sub { font-size: 12px; color: #94a3b8; margin-top: 4px; }
    .med-kpi-bar { display: flex; align-items: center; gap: 8px; }
    .med-badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 20px; font-size: 11.5px; font-weight: 600; }
    .med-badge.blue { background: #dbeafe; color: #2563eb; }
    .med-badge.rose { background: #fce7f3; color: #db2777; }
    .med-badge.teal { background: #d1fae5; color: #059669; }
    .med-badge.gold { background: #fef9c3; color: #ca8a04; }
    .med-appts-section { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; }
    .med-appts-header { display: flex; align-items: center; padding: 18px 22px; border-bottom: 1px solid #f1f5f9; }
    .med-appts-title { font-size: 1rem; font-weight: 700; color: #0f172a; margin: 0; }
    .med-appts-count { color: #64748b; font-weight: 500; margin-inline-start: 6px; }
    .med-appt-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 1px; background: #f1f5f9; }
    .med-appt-card { background: #fff; padding: 16px; display: flex; flex-direction: column; gap: 8px; }
    .med-appt-card-top { display: flex; align-items: flex-start; gap: 10px; }
    .med-appt-avatar { width: 42px; height: 42px; border-radius: 50%; display: grid; place-items: center; font-size: 0.85rem; font-weight: 700; color: #fff; flex-shrink: 0; }
    .med-appt-info { flex: 1; min-width: 0; }
    .med-appt-name { font-weight: 600; font-size: 0.875rem; color: #0f172a; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .med-appt-type { font-size: 0.75rem; color: #64748b; margin-bottom: 4px; }
    .med-appt-time { font-size: 1.4rem; font-weight: 700; color: #0f172a; }
    .med-appt-date { font-size: 0.75rem; color: #94a3b8; }
    @media (max-width: 1200px) { .med-kpi-grid, .med-appt-grid { grid-template-columns: repeat(2,1fr); } }
    @media (max-width: 700px) { .med-kpi-grid, .med-appt-grid { grid-template-columns: 1fr; } }
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

  ringOffset(count: number, total: number): number {
    if (!total) return 138.2;
    return 138.2 * (1 - Math.min(count / total, 1));
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
    PageHeaderComponent, MatProgressSpinnerModule
  ],
  template: `
    <app-page-header titleKey="NAV.CALENDAR"></app-page-header>
    <mat-card class="form-card">
      <h3>{{ 'DOCTOR.ADD_AVAILABILITY' | translate }}</h3>
      <form [formGroup]="slotForm" (ngSubmit)="saveSlot()">
        <mat-form-field appearance="outline">
          <mat-label>{{ 'DOCTOR.DAY' | translate }}</mat-label>
          <mat-select formControlName="dayOfWeek">
            <mat-option *ngFor="let d of dayOptions" [value]="d.value">{{ d.label }}</mat-option>
          </mat-select>
        </mat-form-field>
        <div class="time-row">
          <mat-form-field appearance="outline">
            <mat-label>{{ 'DOCTOR.START_TIME' | translate }}</mat-label>
            <input matInput type="time" formControlName="startTime">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>{{ 'DOCTOR.END_TIME' | translate }}</mat-label>
            <input matInput type="time" formControlName="endTime">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>{{ 'DOCTOR.MIN_PER_SLOT' | translate }}</mat-label>
            <input matInput type="number" formControlName="slotMinutes" min="5">
          </mat-form-field>
        </div>
        <mat-checkbox formControlName="onlineOnly">{{ 'SEARCH.ONLINE' | translate }}</mat-checkbox>
        <button mat-flat-button color="primary" type="submit" [disabled]="slotForm.invalid || saving">{{ 'COMMON.SAVE' | translate }}</button>
      </form>
    </mat-card>
    <div *ngIf="loading" class="loading-wrap"><mat-spinner diameter="40"></mat-spinner></div>
    <div class="page-shell" *ngIf="!loading">
      <div class="app-card entity-card" *ngFor="let s of slots">
        <h3>{{ dayName(s.dayOfWeek) }}</h3>
        <p>{{ formatTime(s.startTime) }} — {{ formatTime(s.endTime) }}</p>
        <p class="muted">{{ s.slotMinutes }} {{ 'DOCTOR.MIN_PER_SLOT' | translate }} · {{ s.onlineOnly ? ('SEARCH.ONLINE' | translate) : ('SEARCH.IN_CLINIC' | translate) }}</p>
      </div>
      <div class="empty-state" *ngIf="!slots.length"><p>{{ 'DOCTOR.NO_AVAILABILITY' | translate }}</p></div>
    </div>
  `,
  styles: [`
    .page-shell { display:flex; flex-direction:column; gap:0.75rem; margin-top:1rem; }
    .entity-card, .form-card { padding:1rem; margin-bottom:0.75rem; }
    .form-card form { display:flex; flex-direction:column; gap:0.5rem; }
    .time-row { display:flex; flex-wrap:wrap; gap:0.5rem; }
    .time-row mat-form-field { flex:1; min-width:120px; }
    .muted { color:var(--tb-text-muted); }
  `]
})
export class DoctorCalendarComponent implements OnInit {
  slots: DoctorAvailability[] = [];
  loading = true;
  saving = false;
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
        this.load();
      },
      error: () => { this.saving = false; }
    });
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
