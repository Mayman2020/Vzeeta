import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { TablePagerComponent } from '../../shared/components/table-pager/table-pager.component';
import { DateFieldComponent } from '../../shared/components/date-field/date-field.component';
import { ListLoadController } from '../../shared/utils/list-load.util';
import { DEFAULT_TABLE_PAGE_SIZE, withPageParams } from '../../core/utils/pagination.util';
import { PatientService } from '../../core/services/patient.service';
import { NotificationService } from '../../core/services/notification.service';
import { AppointmentService } from '../../core/services/appointment.service';
import { Appointment } from '../../core/models/appointment.model';
import { Doctor } from '../../core/models/doctor.model';
import { LabResult, MedicalRecord, NotificationItem, Prescription } from '../../core/services/patient.service';
import { SnackService } from '../../core/services/snack.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { RmsDatePipe } from '../../shared/pipes/rms-date.pipe';
import { formatApiDate } from '../../core/utils/date-value.utils';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-patient-appointments',
  standalone: true,
  imports: [
    NgFor, NgIf, FormsModule, RouterLink, TranslateModule, MatButtonModule, MatChipsModule, MatCardModule,
    MatFormFieldModule, MatInputModule, RmsDatePipe, DateFieldComponent,
    PageHeaderComponent, EmptyStateComponent, TablePagerComponent, MatProgressSpinnerModule
  ],
  template: `
    <div class="app-page appts-page">
      <!-- Header -->
      <div class="appts-header">
        <div>
          <h1 class="appts-title">{{ 'NAV.APPOINTMENTS' | translate }}</h1>
          <p class="appts-sub">{{ 'PATIENT.APPOINTMENTS_SUBTITLE' | translate }}</p>
        </div>
        <a routerLink="/doctors" class="book-new-btn">
          <span class="material-icons">add</span>
          {{ 'HOME.SEARCH' | translate }}
        </a>
      </div>

      <!-- Tabs -->
      <div class="appts-tabs">
        <button class="appt-tab" [class.active]="activeTab === 'upcoming'" (click)="switchTab('upcoming')">
          <span class="material-icons">upcoming</span>
          {{ 'PATIENT.UPCOMING' | translate }}
        </button>
        <button class="appt-tab" [class.active]="activeTab === 'completed'" (click)="switchTab('completed')">
          <span class="material-icons">check_circle</span>
          {{ 'PATIENT.COMPLETED' | translate }}
        </button>
        <button class="appt-tab" [class.active]="activeTab === 'cancelled'" (click)="switchTab('cancelled')">
          <span class="material-icons">cancel</span>
          {{ 'PATIENT.CANCELLED' | translate }}
        </button>
      </div>

      <!-- Loading -->
      <div class="appts-loading" *ngIf="listLoad.showInitialSpinner">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <!-- Cards -->
      <div class="appts-list" *ngIf="listLoad.showSurface && rows.length > 0">
        <div class="appt-card" *ngFor="let a of rows">
          <div class="appt-status-bar" [class]="'status-' + a.status.toLowerCase()"></div>
          <div class="appt-body">
            <div class="appt-doctor">
              <div class="appt-avatar">{{ (a.doctorNameAr || 'D')[0] }}</div>
              <div>
                <div class="appt-doc-name">{{ a.doctorNameAr || ('PATIENT.DOCTOR' | translate) }}</div>
                <div class="appt-doc-spec">{{ a.specialtyNameAr || a.appointmentNumber }}</div>
              </div>
            </div>
            <div class="appt-details">
              <div class="appt-detail-item">
                <span class="material-icons">calendar_today</span>
                {{ a.appointmentDate | rmsDate:'date' }}
              </div>
              <div class="appt-detail-item">
                <span class="material-icons">schedule</span>
                {{ a.startTime }}
              </div>
              <div class="appt-detail-item" *ngIf="a.consultationType">
                <span class="material-icons">{{ a.consultationType === 'ONLINE' ? 'videocam' : 'local_hospital' }}</span>
                {{ (a.consultationType === 'ONLINE' ? 'SEARCH.ONLINE' : 'SEARCH.IN_CLINIC') | translate }}
              </div>
            </div>
            <div class="appt-right">
              <span class="status-chip" [class]="'chip-' + a.status.toLowerCase()">{{ 'STATUS.' + a.status | translate }}</span>
              <span class="appt-fee">{{ a.feeAmount }} {{ 'COMMON.EGP' | translate }}</span>
            </div>
          </div>
          <!-- Actions -->
          <div class="appt-actions" *ngIf="canReschedule(a) || canCancel(a) || canReview(a)">
            <button class="action-btn reschedule" *ngIf="canReschedule(a)" (click)="startReschedule(a)">
              <span class="material-icons">event_repeat</span>
              {{ 'PATIENT.RESCHEDULE' | translate }}
            </button>
            <button class="action-btn cancel" *ngIf="canCancel(a)" (click)="cancel(a)">
              <span class="material-icons">cancel</span>
              {{ 'PATIENT.CANCEL' | translate }}
            </button>
            <button class="action-btn review" *ngIf="canReview(a)" (click)="startReview(a)">
              <span class="material-icons">star_rate</span>
              {{ 'PATIENT.REVIEW_DOCTOR' | translate }}
            </button>
          </div>

          <!-- Review inline form -->
          <div class="reschedule-form" *ngIf="reviewTarget?.id === a.id">
            <div class="rs-fields">
              <label>{{ 'PATIENT.RATING' | translate }}</label>
              <select [(ngModel)]="reviewRating" name="reviewRating" class="time-input">
                <option [ngValue]="5">5</option>
                <option [ngValue]="4">4</option>
                <option [ngValue]="3">3</option>
                <option [ngValue]="2">2</option>
                <option [ngValue]="1">1</option>
              </select>
              <div class="rs-time" style="flex:1">
                <label>{{ 'PATIENT.REVIEW_COMMENT' | translate }}</label>
                <input type="text" [(ngModel)]="reviewComment" name="reviewComment" class="time-input">
              </div>
            </div>
            <div class="rs-actions">
              <button class="action-btn reschedule" (click)="submitReview()">
                {{ 'COMMON.SAVE' | translate }}
              </button>
              <button class="action-btn cancel" (click)="cancelReview()">{{ 'COMMON.CANCEL' | translate }}</button>
            </div>
          </div>

          <!-- Reschedule inline form -->
          <div class="reschedule-form" *ngIf="rescheduleTarget?.id === a.id">
            <div class="rs-fields">
              <app-date-field labelKey="BOOKING.DATE" [(ngModel)]="rescheduleDate" name="rescheduleDate"></app-date-field>
              <div class="rs-time">
                <label>{{ 'BOOKING.TIME' | translate }}</label>
                <input type="time" [(ngModel)]="rescheduleTime" name="rescheduleTime" class="time-input">
              </div>
            </div>
            <div class="rs-actions">
              <button class="action-btn reschedule" (click)="submitReschedule()" [disabled]="!rescheduleDate || !rescheduleTime">
                {{ 'COMMON.SAVE' | translate }}
              </button>
              <button class="action-btn cancel" (click)="cancelReschedule()">{{ 'COMMON.CANCEL' | translate }}</button>
            </div>
          </div>
        </div>
        <app-table-pager [length]="totalElements" [pageSize]="pageSize" [pageIndex]="pageIndex" (pageIndexChange)="onPageChange($event)"/>
      </div>

      <!-- Empty -->
      <div class="appts-empty" *ngIf="listLoad.showSurface && rows.length === 0">
        <div class="empty-icon"><span class="material-icons">event_busy</span></div>
        <h3>{{ 'PATIENT.NO_APPOINTMENTS' | translate }}</h3>
        <a routerLink="/doctors" class="book-new-btn">{{ 'HOME.SEARCH' | translate }}</a>
      </div>
    </div>
  `,
  styles: [`
    .appts-page { width: 100%; max-width: none; margin-inline: 0; }
    .appts-header { display:flex; justify-content:space-between; align-items:flex-start; gap:16px; margin-bottom:24px; flex-wrap:wrap; }
    .appts-title { margin:0 0 4px; font-size:1.5rem; font-weight:900; color:#0f172a; }
    .appts-sub { margin:0; color:#64748b; font-size:0.88rem; }
    .book-new-btn { display:flex; align-items:center; gap:6px; padding:10px 18px; border-radius:10px; background:linear-gradient(135deg,#2563eb,#1d4ed8); color:#fff; font-weight:700; font-size:0.85rem; text-decoration:none; .material-icons{font-size:16px;} }
    .appts-tabs { display:flex; gap:4px; margin-bottom:24px; background:#f1f5f9; border-radius:12px; padding:4px; }
    .appt-tab { flex:1; display:flex; align-items:center; justify-content:center; gap:6px; padding:10px; border:none; border-radius:9px; background:transparent; color:#64748b; font:inherit; font-size:0.85rem; font-weight:600; cursor:pointer; transition:all 0.15s; .material-icons{font-size:16px;} &.active{background:#fff; color:#2563eb; box-shadow:0 2px 8px rgba(15,23,42,0.08);} }
    .tab-badge { background:#ef4444; color:#fff; font-size:0.7rem; font-weight:800; padding:1px 6px; border-radius:999px; }
    .appts-loading { display:flex; justify-content:center; padding:40px; }
    .appts-list { display:flex; flex-direction:column; gap:12px; }
    .appt-card { background:#fff; border:1px solid #e2e8f0; border-radius:14px; overflow:hidden; box-shadow:0 2px 6px rgba(15,23,42,0.04); }
    .appt-status-bar { height:4px; &.status-pending{background:#f59e0b;} &.status-confirmed{background:#2563eb;} &.status-completed{background:#16a34a;} &.status-cancelled{background:#ef4444;} &.status-rescheduled{background:#7c3aed;} }
    .appt-body { display:grid; grid-template-columns:1fr auto auto; gap:16px; align-items:center; padding:16px 18px; }
    .appt-doctor { display:flex; align-items:center; gap:12px; }
    .appt-avatar { width:44px; height:44px; border-radius:12px; background:linear-gradient(135deg,#2563eb,#1d4ed8); color:#fff; font-weight:900; font-size:1.1rem; display:grid; place-items:center; flex-shrink:0; }
    .appt-doc-name { font-weight:800; color:#0f172a; font-size:0.92rem; }
    .appt-doc-spec { color:#64748b; font-size:0.78rem; margin-top:2px; }
    .appt-details { display:flex; flex-direction:column; gap:5px; }
    .appt-detail-item { display:flex; align-items:center; gap:5px; font-size:0.8rem; color:#475569; .material-icons{font-size:14px; color:#94a3b8;} }
    .appt-right { display:flex; flex-direction:column; align-items:flex-end; gap:6px; }
    .status-chip { display:inline-block; padding:3px 10px; border-radius:999px; font-size:0.74rem; font-weight:700;
      &.chip-pending{background:#fef9c3; color:#ca8a04;} &.chip-confirmed{background:#dbeafe; color:#1d4ed8;} &.chip-completed{background:#dcfce7; color:#16a34a;} &.chip-cancelled{background:#fee2e2; color:#ef4444;} &.chip-rescheduled{background:#ede9fe; color:#7c3aed;} }
    .appt-fee { font-size:0.92rem; font-weight:800; color:#0f172a; }
    .appt-actions { display:flex; gap:8px; padding:10px 18px; border-top:1px solid #f1f5f9; }
    .action-btn { display:flex; align-items:center; gap:5px; padding:8px 14px; border-radius:8px; border:1.5px solid; font:inherit; font-size:0.82rem; font-weight:600; cursor:pointer; transition:all 0.15s; .material-icons{font-size:15px;}
      &.reschedule{border-color:#2563eb; color:#2563eb; background:#fff; &:hover{background:#eff6ff;}}
      &.cancel{border-color:#ef4444; color:#ef4444; background:#fff; &:hover{background:#fee2e2;}}
      &.review{border-color:#f59e0b; color:#d97706; background:#fff; &:hover{background:#fffbeb;}}
      &:disabled{opacity:0.5; cursor:not-allowed;} }
    .reschedule-form { padding:14px 18px; background:#f8fafc; border-top:1px solid #e2e8f0; }
    .rs-fields { display:flex; gap:12px; align-items:flex-start; flex-wrap:wrap; margin-bottom:12px; }
    .rs-time { display:flex; flex-direction:column; gap:4px; label{font-size:0.8rem; font-weight:600; color:#475569;} }
    .time-input { padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:8px; font:inherit; font-size:0.88rem; color:#0f172a; }
    .rs-actions { display:flex; gap:8px; }
    .appts-empty { display:flex; flex-direction:column; align-items:center; gap:14px; padding:48px 24px; text-align:center; h3{margin:0; color:#0f172a;} }
    .empty-icon { width:64px; height:64px; border-radius:50%; background:#f1f5f9; display:grid; place-items:center; .material-icons{font-size:32px; color:#94a3b8;} }
    @media (max-width: 600px) {
      .appt-body { grid-template-columns: 1fr; }
      .appt-right { align-items: flex-start; flex-direction: row; }
      .appts-tabs { .appt-tab .material-icons { display: none; } }
    }
  `]
})
export class PatientAppointmentsComponent implements OnInit {
  listLoad = new ListLoadController();
  rows: Appointment[] = [];
  pageIndex = 0;
  pageSize = DEFAULT_TABLE_PAGE_SIZE;
  totalElements = 0;
  searchTerm = '';
  rescheduleTarget: Appointment | null = null;
  rescheduleDate = formatApiDate(new Date());
  rescheduleTime = '09:00';
  reviewTarget: Appointment | null = null;
  reviewRating = 5;
  reviewComment = '';
  activeTab: 'upcoming' | 'completed' | 'cancelled' = 'upcoming';
  private searchTimer?: ReturnType<typeof setTimeout>;

  switchTab(tab: 'upcoming' | 'completed' | 'cancelled'): void {
    this.activeTab = tab;
    this.pageIndex = 0;
    this.load();
  }

  constructor(
    private readonly patientService: PatientService,
    private readonly appointmentService: AppointmentService,
    private readonly snack: SnackService,
    private readonly i18n: I18nService
  ) {}

  ngOnInit(): void { this.load(); }
  load(): void {
    this.listLoad.begin();
    this.patientService.getAppointments(withPageParams(this.pageIndex, this.pageSize, {
      q: this.searchTerm,
      statusGroup: this.activeTab
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
  hasActiveFilters(): boolean { return !!this.searchTerm?.trim(); }
  canCancel(a: Appointment): boolean {
    return a.status === 'PENDING' || a.status === 'CONFIRMED' || a.status === 'RESCHEDULED';
  }
  canReschedule(a: Appointment): boolean {
    return a.status === 'PENDING' || a.status === 'CONFIRMED' || a.status === 'RESCHEDULED';
  }
  canReview(a: Appointment): boolean {
    return a.status === 'COMPLETED';
  }
  startReview(a: Appointment): void {
    this.reviewTarget = a;
    this.reviewRating = 5;
    this.reviewComment = '';
    this.rescheduleTarget = null;
  }
  cancelReview(): void { this.reviewTarget = null; }
  submitReview(): void {
    if (!this.reviewTarget) return;
    this.patientService.createReview({
      appointmentId: this.reviewTarget.id,
      rating: this.reviewRating,
      comment: this.reviewComment || undefined
    }).subscribe({
      next: () => {
        this.snack.success(this.i18n.instant('PATIENT.REVIEW_SUCCESS'));
        this.reviewTarget = null;
      },
      error: (e: Error) => this.snack.error(e.message)
    });
  }
  startReschedule(a: Appointment): void {
    this.rescheduleTarget = a;
    this.rescheduleDate = a.appointmentDate;
    this.rescheduleTime = (a.startTime ?? '09:00').substring(0, 5);
  }
  cancelReschedule(): void { this.rescheduleTarget = null; }
  submitReschedule(): void {
    if (!this.rescheduleTarget || !this.rescheduleDate || !this.rescheduleTime) return;
    this.appointmentService.reschedule(this.rescheduleTarget.id, this.rescheduleDate, this.rescheduleTime).subscribe({
      next: () => {
        this.snack.success(this.i18n.instant('PATIENT.RESCHEDULE_SUCCESS'));
        this.rescheduleTarget = null;
        this.load();
      },
      error: (e: Error) => this.snack.error(e.message)
    });
  }
  cancel(a: Appointment): void {
    this.appointmentService.cancel(a.id).subscribe({
      next: () => { this.snack.success(this.i18n.instant('PATIENT.CANCEL_SUCCESS')); this.load(); },
      error: (e: Error) => this.snack.error(e.message)
    });
  }
  goSearch(): void { window.location.href = '/doctors'; }
}

@Component({
  selector: 'app-patient-favorites',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink, TranslateModule, MatCardModule, MatButtonModule, MatIconModule, MatTooltipModule, PageHeaderComponent, MatProgressSpinnerModule],
  template: `
    <div class="app-page">
      <app-page-header titleKey="NAV.FAVORITES"></app-page-header>
      <div *ngIf="loading" class="loading-wrap"><mat-spinner diameter="40"></mat-spinner></div>
      <ng-container *ngIf="!loading">
        <div class="app-card entity-card" *ngFor="let d of items">
          <div class="card-row">
            <div>
              <h3>{{ d.fullNameAr || d.fullName }}</h3>
              <p>{{ d.specialty }} · {{ d.area }}</p>
              <p class="fee">{{ d.consultationFee }} {{ 'COMMON.EGP' | translate }}</p>
            </div>
            <div class="actions">
              <a mat-flat-button color="primary" [routerLink]="['/booking', d.id]">{{ 'BOOKING.BOOK_NOW' | translate }}</a>
              <button type="button" class="app-icon-btn danger" (click)="remove(d)" [matTooltip]="'ACTIONS.DELETE' | translate">
                <mat-icon>favorite</mat-icon>
              </button>
            </div>
          </div>
        </div>
        <div class="empty-state" *ngIf="!items.length">
          <mat-icon>favorite_border</mat-icon>
          <p>{{ 'PATIENT.NO_FAVORITES' | translate }}</p>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .entity-card { padding: 1rem; }
    .card-row { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
    .fee { color: var(--tb-primary); font-weight: 600; }
    .empty-state { text-align: center; padding: 3rem; color: var(--tb-text-muted); }
  `]
})
export class PatientFavoritesComponent implements OnInit {
  items: Doctor[] = [];
  loading = true;

  constructor(private readonly patientService: PatientService, private readonly snack: SnackService, private readonly i18n: I18nService) {}

  ngOnInit(): void {
    this.patientService.getFavorites().subscribe({
      next: (items) => { this.items = items; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  remove(d: Doctor): void {
    this.patientService.removeFavorite(d.id).subscribe({
      next: () => {
        this.items = this.items.filter((x) => x.id !== d.id);
        this.snack.success(this.i18n.instant('PATIENT.REMOVED_FAVORITE'));
      }
    });
  }
}

@Component({
  selector: 'app-patient-prescriptions',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, RmsDatePipe, TranslateModule, PageHeaderComponent, EmptyStateComponent, TablePagerComponent, MatProgressSpinnerModule],
  template: `
    <div class="app-page">
      <app-page-header titleKey="NAV.PRESCRIPTIONS"></app-page-header>
      <div *ngIf="listLoad.showInitialSpinner" class="loading-wrap"><mat-spinner diameter="40"></mat-spinner></div>
      <app-empty-state *ngIf="listLoad.showSurface && rows.length === 0 && !hasActiveFilters()" icon="medication" titleKey="PATIENT.NO_PRESCRIPTIONS"></app-empty-state>
      <div class="app-list-surface" *ngIf="listLoad.showSurface && (rows.length > 0 || hasActiveFilters())">
        <section class="list-stats"><article class="stat-pill stat-pill--count"><strong>{{ totalElements }}</strong></article></section>
        <section class="app-card table-card">
          <div class="estate-table-toolbar directory-toolbar">
            <label class="estate-search-inline"><span class="material-icons">search</span>
              <input [(ngModel)]="searchTerm" (ngModelChange)="onSearch()" [placeholder]="'NAV.PRESCRIPTIONS' | translate">
            </label>
          </div>
          <div class="app-table-wrap"><table class="app-data-table"><thead><tr>
            <th>{{ 'NAV.PRESCRIPTIONS' | translate }}</th><th>{{ 'COMMON.ALL' | translate }}</th>
          </tr></thead><tbody>
            <tr *ngFor="let p of rows">
              <td>{{ p.diagnosisAr || p.diagnosisEn || ('NAV.PRESCRIPTIONS' | translate) }}<ul><li *ngFor="let item of p.items">{{ item.medicineName }} — {{ item.dosage }}</li></ul></td>
              <td>{{ p.createdAt | rmsDate:'datetime' }}</td>
            </tr>
          </tbody></table></div>
          <app-table-pager [length]="totalElements" [pageSize]="pageSize" [pageIndex]="pageIndex" (pageIndexChange)="onPageChange($event)"/>
        </section>
      </div>
    </div>
  `
})
export class PatientPrescriptionsComponent implements OnInit {
  listLoad = new ListLoadController();
  rows: Prescription[] = [];
  pageIndex = 0;
  pageSize = DEFAULT_TABLE_PAGE_SIZE;
  totalElements = 0;
  searchTerm = '';
  private searchTimer?: ReturnType<typeof setTimeout>;
  constructor(private readonly patientService: PatientService) {}
  ngOnInit(): void { this.load(); }
  load(): void {
    this.listLoad.begin();
    this.patientService.getPrescriptions(withPageParams(this.pageIndex, this.pageSize, { q: this.searchTerm })).subscribe({
      next: (res) => { this.rows = res.content; this.totalElements = res.totalElements; this.listLoad.end(); },
      error: () => { this.rows = []; this.totalElements = 0; this.listLoad.end(); }
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
  selector: 'app-patient-lab-results',
  standalone: true,
  imports: [NgFor, NgIf, RmsDatePipe, TranslateModule, MatButtonModule, PageHeaderComponent, EmptyStateComponent, TablePagerComponent, MatProgressSpinnerModule],
  template: `
    <div class="app-page">
      <app-page-header titleKey="NAV.LAB_RESULTS"></app-page-header>
      <div *ngIf="listLoad.showInitialSpinner" class="loading-wrap"><mat-spinner diameter="40"></mat-spinner></div>
      <app-empty-state *ngIf="listLoad.showSurface && rows.length === 0" icon="science" titleKey="PATIENT.NO_LAB_RESULTS"></app-empty-state>
      <div class="app-list-surface" *ngIf="listLoad.showSurface && rows.length > 0">
        <section class="list-stats"><article class="stat-pill stat-pill--count"><strong>{{ totalElements }}</strong></article></section>
        <section class="app-card table-card">
          <div class="app-table-wrap"><table class="app-data-table"><thead><tr>
            <th>{{ 'NAV.LAB_RESULTS' | translate }}</th><th>{{ 'COMMON.ALL' | translate }}</th><th>{{ 'COMMON.ACTIONS' | translate }}</th>
          </tr></thead><tbody>
            <tr *ngFor="let r of rows">
              <td>{{ r.testNameAr }}<br><span class="muted">{{ r.resultSummary }}</span></td>
              <td>{{ r.resultDate | rmsDate:'date' }}</td>
              <td>
                <a *ngIf="downloadUrl(r) as url" mat-stroked-button [href]="url" target="_blank" rel="noopener">{{ 'PATIENT.DOWNLOAD' | translate }}</a>
                <span *ngIf="!downloadUrl(r)">—</span>
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
export class PatientLabResultsComponent implements OnInit {
  listLoad = new ListLoadController();
  rows: LabResult[] = [];
  pageIndex = 0;
  pageSize = DEFAULT_TABLE_PAGE_SIZE;
  totalElements = 0;
  constructor(private readonly patientService: PatientService) {}
  ngOnInit(): void { this.load(); }
  load(): void {
    this.listLoad.begin();
    this.patientService.getLabResults(withPageParams(this.pageIndex, this.pageSize)).subscribe({
      next: (res) => { this.rows = res.content; this.totalElements = res.totalElements; this.listLoad.end(); },
      error: () => { this.rows = []; this.totalElements = 0; this.listLoad.end(); }
    });
  }
  onPageChange(i: number): void { this.pageIndex = i; this.load(); }
  downloadUrl(r: LabResult): string | null {
    const raw = r.fileUrl || r.attachmentUrl;
    if (!raw?.trim()) return null;
    if (raw.startsWith('http')) return raw;
    const base = (typeof window !== 'undefined' && (window as Window & { __TB_FILE_URL__?: string }).__TB_FILE_URL__) || environment.fileUrl;
    return raw.startsWith('/') ? `${base.replace(/\/$/, '')}${raw}` : `${base.replace(/\/$/, '')}/${raw}`;
  }
}

@Component({
  selector: 'app-patient-medical-records',
  standalone: true,
  imports: [NgFor, NgIf, RmsDatePipe, TranslateModule, MatCardModule, MatButtonModule, MatIconModule, PageHeaderComponent, MatProgressSpinnerModule, TablePagerComponent],
  template: `
    <div class="app-page mr-page">
      <div class="mr-header">
        <div>
          <h1 class="mr-title">{{ 'NAV.MEDICAL_RECORDS' | translate }}</h1>
          <p class="mr-sub">{{ 'PATIENT.RECORDS_SUBTITLE' | translate }}</p>
        </div>
      </div>
      <div class="mr-loading" *ngIf="listLoad.showInitialSpinner"><mat-spinner diameter="40"></mat-spinner></div>
      <div class="mr-grid" *ngIf="listLoad.showSurface && items.length > 0">
        <div class="mr-card" *ngFor="let r of items">
          <div class="mr-card-icon" [class]="iconClass(r.recordType)">
            <span class="material-icons">{{ recordIcon(r.recordType) }}</span>
          </div>
          <div class="mr-card-body">
            <div class="mr-card-type">{{ 'RECORD_TYPE.' + r.recordType | translate }}</div>
            <h3 class="mr-card-title">{{ recordTitle(r) }}</h3>
            <p class="mr-card-desc">{{ recordDescription(r) }}</p>
            <div class="mr-card-date">
              <span class="material-icons">calendar_today</span>
              {{ r.createdAt | rmsDate:'date' }}
            </div>
          </div>
        </div>
      </div>
      <app-table-pager *ngIf="listLoad.showSurface && totalElements > pageSize"
        [length]="totalElements" [pageSize]="pageSize" [pageIndex]="pageIndex" (pageIndexChange)="onPageChange($event)"/>
      <div class="mr-empty" *ngIf="listLoad.showSurface && !items.length">
        <div class="empty-icon"><span class="material-icons">folder_open</span></div>
        <h3>{{ 'PATIENT.NO_RECORDS' | translate }}</h3>
      </div>
    </div>
  `,
  styles: [`
    .mr-page { width: 100%; max-width: none; margin-inline: 0; }
    .mr-header { margin-bottom: 24px; }
    .mr-title { margin: 0 0 4px; font-size: 1.5rem; font-weight: 900; color: #0f172a; }
    .mr-sub { margin: 0; color: #64748b; font-size: 0.88rem; }
    .mr-loading { display: flex; justify-content: center; padding: 40px; }
    .mr-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
    .mr-card { display: flex; gap: 14px; background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; box-shadow: 0 2px 6px rgba(15,23,42,0.04); transition: box-shadow 0.15s; &:hover { box-shadow: 0 6px 18px rgba(15,23,42,0.08); } }
    .mr-card-icon { width: 48px; height: 48px; border-radius: 12px; display: grid; place-items: center; flex-shrink: 0; .material-icons { font-size: 22px; }
      &.diagnosis { background: #dbeafe; .material-icons { color: #2563eb; } }
      &.prescription { background: #d1fae5; .material-icons { color: #059669; } }
      &.lab { background: #fde8d8; .material-icons { color: #ea580c; } }
      &.imaging { background: #ede9fe; .material-icons { color: #7c3aed; } }
      &.default { background: #f1f5f9; .material-icons { color: #64748b; } } }
    .mr-card-body { flex: 1; min-width: 0; }
    .mr-card-type { font-size: 0.72rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
    .mr-card-title { margin: 0 0 6px; font-size: 0.95rem; font-weight: 800; color: #0f172a; }
    .mr-card-desc { margin: 0 0 10px; font-size: 0.82rem; color: #475569; line-height: 1.6; }
    .mr-card-date { display: flex; align-items: center; gap: 4px; font-size: 0.76rem; color: #94a3b8; .material-icons { font-size: 14px; } }
    .mr-empty { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 48px 24px; text-align: center; h3 { margin: 0; color: #0f172a; } }
    .empty-icon { width: 64px; height: 64px; border-radius: 50%; background: #f1f5f9; display: grid; place-items: center; .material-icons { font-size: 32px; color: #94a3b8; } }
  `]
})
export class PatientMedicalRecordsComponent implements OnInit {
  listLoad = new ListLoadController();
  items: MedicalRecord[] = [];
  pageIndex = 0;
  pageSize = DEFAULT_TABLE_PAGE_SIZE;
  totalElements = 0;

  constructor(
    private readonly patientService: PatientService,
    private readonly i18n: I18nService
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.listLoad.begin();
    this.patientService.getMedicalRecords(withPageParams(this.pageIndex, this.pageSize)).subscribe({
      next: (res) => {
        this.items = res.content;
        this.totalElements = res.totalElements;
        this.listLoad.end();
      },
      error: () => {
        this.items = [];
        this.totalElements = 0;
        this.listLoad.end();
      }
    });
  }

  onPageChange(index: number): void {
    this.pageIndex = index;
    this.load();
  }

  recordTitle(r: MedicalRecord): string {
    return this.i18n.currentLang === 'ar' ? r.titleAr : (r.titleEn || r.titleAr);
  }

  recordDescription(r: MedicalRecord): string {
    return this.i18n.currentLang === 'ar' ? (r.descriptionAr ?? '') : (r.descriptionEn || r.descriptionAr || '');
  }

  recordIcon(type: string): string {
    const map: Record<string, string> = {
      DIAGNOSIS: 'diagnosis', PRESCRIPTION: 'medication', LAB: 'science', IMAGING: 'radiology'
    };
    return map[type?.toUpperCase()] ?? 'description';
  }

  iconClass(type: string): string {
    const map: Record<string, string> = {
      DIAGNOSIS: 'diagnosis', PRESCRIPTION: 'prescription', LAB: 'lab', IMAGING: 'imaging'
    };
    return map[type?.toUpperCase()] ?? 'default';
  }
}

@Component({
  selector: 'app-patient-notifications',
  standalone: true,
  imports: [
    NgFor, NgIf, NgClass, RmsDatePipe, TranslateModule, MatButtonModule, MatTabsModule, MatTooltipModule,
    PageHeaderComponent, EmptyStateComponent, TablePagerComponent, MatProgressSpinnerModule
  ],
  template: `
    <div class="app-page notifications-page">
      <app-page-header
        titleKey="NOTIFICATIONS.TITLE"
        subtitleKey="NOTIFICATIONS.SUBTITLE">
        <button mat-stroked-button type="button" (click)="markAllRead()">{{ 'NOTIFICATIONS.MARK_ALL_READ' | translate }}</button>
      </app-page-header>

      <div *ngIf="listLoad.showInitialSpinner" class="loading-wrap"><mat-spinner diameter="40"></mat-spinner></div>

      <ng-container *ngIf="listLoad.showSurface">
        <mat-tab-group
          class="notify-scope-tabs"
          animationDuration="0ms"
          [selectedIndex]="tabIndex"
          (selectedIndexChange)="onTabChange($event)">
          <mat-tab [label]="'NOTIFICATIONS.TAB_RECENT' | translate"></mat-tab>
          <mat-tab [label]="'NOTIFICATIONS.TAB_OLDER' | translate"></mat-tab>
        </mat-tab-group>

        <div class="app-card notifications-card" *ngIf="rows.length; else emptyTpl">
          <div class="notification-list">
            <button
              type="button"
              class="notification-row"
              *ngFor="let n of rows"
              [class.unread]="!n.readFlag"
              (click)="open(n)">
              <span class="notification-icon material-icons" [ngClass]="iconTone(n)">{{ notificationIcon(n) }}</span>
              <span class="notification-copy">
                <span class="notification-row-head">
                  <strong>{{ notificationTitle(n) }}</strong>
                  <span class="status-badge" [attr.data-status]="n.readFlag ? 'ACTIVE' : 'PENDING'">
                    {{ (n.readFlag ? 'NOTIFICATIONS.READ' : 'NOTIFICATIONS.NEW') | translate }}
                  </span>
                </span>
                <span class="notification-message">{{ notificationBody(n) }}</span>
                <span class="notification-meta">
                  {{ 'NOTIFICATIONS.DATE' | translate }} {{ n.createdAt | rmsDate }}
                  <span aria-hidden="true">•</span>
                  {{ 'NOTIFICATIONS.TIME' | translate }} {{ n.createdAt | rmsDate:'time' }}
                </span>
              </span>
              <span class="app-icon-btn accent notification-open" [matTooltip]="'NOTIFICATIONS.OPEN_LINK' | translate">
                <span class="material-icons">arrow_forward</span>
              </span>
            </button>
          </div>
          <app-table-pager
            [length]="totalElements"
            [pageSize]="pageSize"
            [pageIndex]="pageIndex"
            (pageIndexChange)="onPageChange($event)">
          </app-table-pager>
        </div>

        <ng-template #emptyTpl>
          <app-empty-state
            icon="notifications_none"
            titleKey="NOTIFICATIONS.EMPTY"
            messageKey="NOTIFICATIONS.EMPTY_TAB_HINT">
          </app-empty-state>
        </ng-template>
      </ng-container>
    </div>
  `
})
export class PatientNotificationsComponent implements OnInit {
  listLoad = new ListLoadController();
  rows: NotificationItem[] = [];
  pageIndex = 0;
  readonly pageSize = 5;
  totalElements = 0;
  tabIndex = 0;
  private activeScope: 'recent' | 'older' = 'recent';

  constructor(
    private readonly patientService: PatientService,
    private readonly notificationService: NotificationService,
    private readonly i18n: I18nService,
    private readonly router: Router
  ) {}

  ngOnInit(): void { this.load(); }

  onTabChange(index: number): void {
    this.tabIndex = index;
    this.activeScope = index === 0 ? 'recent' : 'older';
    this.pageIndex = 0;
    this.load();
  }

  notificationTitle(n: NotificationItem): string {
    return this.i18n.currentLang === 'ar' ? n.titleAr : (n.titleEn || n.titleAr);
  }

  notificationBody(n: NotificationItem): string {
    return this.i18n.currentLang === 'ar' ? (n.bodyAr ?? '') : (n.bodyEn || n.bodyAr || '');
  }

  notificationIcon(n: NotificationItem): string {
    const type = (n.type || '').toUpperCase();
    if (type.includes('APPOINTMENT') || type.includes('BOOKING')) return 'event';
    if (type.includes('PRESCRIPTION') || type.includes('RX')) return 'medication';
    if (type.includes('LAB')) return 'science';
    if (type.includes('REMINDER')) return 'alarm';
    if (type.includes('VIDEO')) return 'videocam';
    return 'notifications';
  }

  iconTone(n: NotificationItem): string {
    const type = (n.type || '').toUpperCase();
    if (type.includes('APPOINTMENT') || type.includes('BOOKING')) return 'appointment';
    if (type.includes('PRESCRIPTION') || type.includes('RX')) return 'prescription';
    if (type.includes('LAB')) return 'lab';
    if (type.includes('REMINDER')) return 'reminder';
    return '';
  }

  load(): void {
    this.listLoad.begin();
    this.patientService.getNotifications(withPageParams(this.pageIndex, this.pageSize, { scope: this.activeScope })).subscribe({
      next: (res) => {
        this.rows = res.content;
        this.totalElements = res.totalElements;
        this.listLoad.end();
      },
      error: () => {
        this.rows = [];
        this.totalElements = 0;
        this.listLoad.end();
      }
    });
  }

  onPageChange(i: number): void {
    this.pageIndex = i;
    this.load();
  }

  markAllRead(): void {
    this.patientService.markAllNotificationsRead().subscribe({
      next: () => {
        this.rows.forEach((n) => { n.readFlag = true; });
        this.notificationService.setUnreadCount(0);
        this.load();
      }
    });
  }

  open(n: NotificationItem): void {
    if (!n.readFlag) {
      this.patientService.markNotificationRead(n.id).subscribe({
        next: () => {
          n.readFlag = true;
          this.notificationService.refreshUnreadCount();
        }
      });
    }
    const ref = n.referenceType?.toUpperCase() ?? '';
    if (ref.includes('APPOINTMENT')) {
      void this.router.navigate(['/patient/appointments']);
      return;
    }
    if (ref.includes('PRESCRIPTION')) {
      void this.router.navigate(['/patient/prescriptions']);
      return;
    }
    if (ref.includes('LAB')) {
      void this.router.navigate(['/patient/lab-results']);
    }
  }
}

@Component({
  selector: 'app-patient-video-consultation',
  standalone: true,
  imports: [NgIf, TranslateModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="vc-page">
      <div class="vc-topbar">
        <div class="vc-session-info">
          <div class="vc-avatar-sm">{{ doctorInitial }}</div>
          <div>
            <div class="vc-doctor-name">{{ doctorName || ('VIDEO.SESSION_WITH' | translate) }}</div>
            <div class="vc-status">
              <span class="vc-dot" [class.connected]="jitsiReady"></span>
              {{ (jitsiReady ? 'VIDEO.CONNECTED' : 'VIDEO.CONNECTING') | translate }}
            </div>
          </div>
        </div>
        <div class="vc-room-id">{{ roomName }}</div>
        <button class="end-call-btn" (click)="endCall()">
          <span class="material-icons">call_end</span>
          {{ 'VIDEO.END_CALL' | translate }}
        </button>
      </div>

      <div class="vc-main">
        <div *ngIf="!jitsiReady" class="vc-loading">
          <mat-spinner diameter="48"></mat-spinner>
          <p>{{ 'VIDEO.CONNECTING' | translate }}</p>
        </div>
        <div id="jitsi-container" class="jitsi-frame"></div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: calc(100vh - 64px); background: #0f172a; }
    .vc-page { display: flex; flex-direction: column; height: 100%; color: #fff; }
    .vc-topbar { display: flex; align-items: center; gap: 16px; padding: 12px 20px; background: rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.1); flex-wrap: wrap; }
    .vc-session-info { display: flex; align-items: center; gap: 10px; flex: 1; }
    .vc-avatar-sm { width: 38px; height: 38px; border-radius: 50%; background: linear-gradient(135deg, #2563eb, #1d4ed8); display: grid; place-items: center; font-weight: 800; font-size: 1rem; flex-shrink: 0; }
    .vc-doctor-name { font-size: 0.85rem; font-weight: 700; color: #e2e8f0; }
    .vc-status { display: flex; align-items: center; gap: 5px; font-size: 0.75rem; color: #94a3b8; }
    .vc-dot { width: 7px; height: 7px; border-radius: 50%; background: #ef4444; }
    .vc-dot.connected { background: #22c55e; }
    .vc-room-id { font-size: 0.75rem; color: #64748b; font-family: monospace; }
    .end-call-btn { display: flex; align-items: center; gap: 6px; padding: 8px 18px; border: none; border-radius: 10px; background: #ef4444; color: #fff; font: inherit; font-weight: 700; font-size: 0.85rem; cursor: pointer; }
    .vc-main { flex: 1; position: relative; overflow: hidden; }
    .vc-loading { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; color: #94a3b8; background: #0f172a; z-index: 10; }
    .jitsi-frame { width: 100%; height: 100%; }
  `]
})
export class PatientVideoConsultationComponent implements OnInit, OnDestroy {
  jitsiReady = false;
  doctorName = '';
  doctorInitial = 'D';
  roomName = '';
  private jitsiApi: unknown = null;

  constructor(private readonly route: ActivatedRoute) {}

  ngOnInit(): void {
    const appointmentId = this.route.snapshot.paramMap.get('appointmentId') ?? 'guest';
    this.roomName = `vzeeta-appt-${appointmentId}`;
    this.loadJitsi();
  }

  private loadJitsi(): void {
    const scriptId = 'jitsi-external-api';
    if (document.getElementById(scriptId)) {
      this.initJitsi();
      return;
    }
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://meet.jit.si/external_api.js';
    script.onload = () => this.initJitsi();
    document.head.appendChild(script);
  }

  private initJitsi(): void {
    const JitsiMeetExternalAPI = (window as unknown as Record<string, unknown>)['JitsiMeetExternalAPI'] as new (domain: string, options: Record<string, unknown>) => Record<string, unknown>;
    if (!JitsiMeetExternalAPI) return;

    const container = document.getElementById('jitsi-container');
    if (!container) return;

    this.jitsiApi = new JitsiMeetExternalAPI('meet.jit.si', {
      roomName: this.roomName,
      parentNode: container,
      width: '100%',
      height: '100%',
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        disableDeepLinking: true,
        prejoinPageEnabled: false
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        TOOLBAR_BUTTONS: ['microphone', 'camera', 'desktop', 'chat', 'raisehand', 'videoquality', 'fullscreen', 'hangup']
      }
    }) as Record<string, unknown>;

    const api = this.jitsiApi as Record<string, (event: string, handler: () => void) => void>;
    api['addEventListener']('videoConferenceJoined', () => { this.jitsiReady = true; });
    api['addEventListener']('readyToClose', () => { this.endCall(); });
  }

  endCall(): void {
    if (this.jitsiApi) {
      const api = this.jitsiApi as Record<string, () => void>;
      try { api['dispose'](); } catch { /* ignore */ }
    }
    window.history.back();
  }

  ngOnDestroy(): void {
    this.endCall();
  }
}
