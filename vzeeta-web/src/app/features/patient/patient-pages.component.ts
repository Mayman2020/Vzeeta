import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
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
    <div class="app-page">
      <app-page-header titleKey="NAV.APPOINTMENTS" subtitleKey="PATIENT.APPOINTMENTS_SUBTITLE"></app-page-header>
      <div *ngIf="listLoad.showInitialSpinner" class="loading-wrap"><mat-spinner diameter="40"></mat-spinner></div>
      <app-empty-state *ngIf="listLoad.showSurface && rows.length === 0 && !hasActiveFilters()" icon="event_busy" titleKey="PATIENT.NO_APPOINTMENTS" actionKey="HOME.SEARCH" (actionClick)="goSearch()"></app-empty-state>
      <div class="app-list-surface" [class.is-refreshing]="listLoad.refreshing" *ngIf="listLoad.showSurface && (rows.length > 0 || hasActiveFilters())">
        <div class="list-refresh-spinner" *ngIf="listLoad.refreshing"><mat-spinner diameter="32"></mat-spinner></div>
        <section class="list-stats"><article class="stat-pill"><span class="stat-label">{{ 'COMMON.ALL' | translate }}</span><strong>{{ totalElements }}</strong></article></section>
        <section class="app-card table-card">
          <div class="estate-table-toolbar">
            <label class="estate-search-inline"><span class="material-icons">search</span>
              <input [(ngModel)]="searchTerm" (ngModelChange)="onSearch()" [placeholder]="'NAV.APPOINTMENTS' | translate">
            </label>
          </div>
          <div class="app-table-wrap"><table class="app-data-table"><thead><tr>
            <th>{{ 'NAV.DOCTORS' | translate }}</th><th>{{ 'NAV.APPOINTMENTS' | translate }}</th><th>{{ 'COMMON.STATUS' | translate }}</th><th>{{ 'COMMON.ACTIONS' | translate }}</th>
          </tr></thead><tbody>
            <tr *ngFor="let a of rows">
              <td>{{ a.doctorNameAr || ('PATIENT.DOCTOR' | translate) }}<br><span class="muted">{{ a.appointmentNumber }}</span></td>
              <td>{{ a.appointmentDate | rmsDate:'date' }} {{ a.startTime }}</td>
              <td><mat-chip>{{ 'STATUS.' + a.status | translate }}</mat-chip></td>
              <td class="actions">
                <span class="fee">{{ a.feeAmount }} {{ 'COMMON.EGP' | translate }}</span>
                <button mat-stroked-button *ngIf="canReschedule(a)" (click)="startReschedule(a)">{{ 'PATIENT.RESCHEDULE' | translate }}</button>
                <button mat-stroked-button color="warn" *ngIf="canCancel(a)" (click)="cancel(a)">{{ 'PATIENT.CANCEL' | translate }}</button>
              </td>
            </tr>
          </tbody></table></div>
          <mat-card class="reschedule-card" *ngIf="rescheduleTarget">
            <h4>{{ 'PATIENT.RESCHEDULE' | translate }} — {{ rescheduleTarget.appointmentNumber }}</h4>
            <div class="reschedule-fields">
              <app-date-field labelKey="BOOKING.DATE" [(ngModel)]="rescheduleDate" name="rescheduleDate"></app-date-field>
              <mat-form-field appearance="outline">
                <mat-label>{{ 'BOOKING.TIME' | translate }}</mat-label>
                <input matInput type="time" [(ngModel)]="rescheduleTime" name="rescheduleTime">
              </mat-form-field>
            </div>
            <div class="actions">
              <button mat-flat-button color="primary" (click)="submitReschedule()" [disabled]="!rescheduleDate || !rescheduleTime">{{ 'COMMON.SAVE' | translate }}</button>
              <button mat-stroked-button (click)="cancelReschedule()">{{ 'COMMON.CANCEL' | translate }}</button>
            </div>
          </mat-card>
          <app-table-pager [length]="totalElements" [pageSize]="pageSize" [pageIndex]="pageIndex" (pageIndexChange)="onPageChange($event)"/>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .muted { color: var(--tb-text-muted); font-size: 0.85rem; }
    .fee { font-weight: 700; color: var(--tb-primary); margin-inline-end: 0.5rem; }
    .actions { display:flex; gap:0.5rem; flex-wrap:wrap; align-items:center; }
    .reschedule-card { padding:1rem; margin-top:1rem; }
    .reschedule-fields { display:flex; flex-wrap:wrap; gap:0.75rem; align-items:flex-start; }
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
  private searchTimer?: ReturnType<typeof setTimeout>;

  constructor(
    private readonly patientService: PatientService,
    private readonly appointmentService: AppointmentService,
    private readonly snack: SnackService,
    private readonly i18n: I18nService
  ) {}

  ngOnInit(): void { this.load(); }
  load(): void {
    this.listLoad.begin();
    this.patientService.getAppointments(withPageParams(this.pageIndex, this.pageSize, { q: this.searchTerm })).subscribe({
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
  imports: [NgFor, NgIf, RouterLink, TranslateModule, MatCardModule, MatButtonModule, MatIconModule, PageHeaderComponent, MatProgressSpinnerModule],
  template: `
    <app-page-header titleKey="NAV.FAVORITES"></app-page-header>
    <div *ngIf="loading" class="loading-wrap"><mat-spinner diameter="40"></mat-spinner></div>
    <div class="page-shell" *ngIf="!loading">
      <div class="app-card entity-card" *ngFor="let d of items">
        <div class="card-row">
          <div>
            <h3>{{ d.fullNameAr || d.fullName }}</h3>
            <p>{{ d.specialty }} · {{ d.area }}</p>
            <p class="fee">{{ d.consultationFee }} {{ 'COMMON.EGP' | translate }}</p>
          </div>
          <div class="actions">
            <a mat-flat-button color="primary" [routerLink]="['/booking', d.id]">{{ 'BOOKING.BOOK_NOW' | translate }}</a>
            <button mat-icon-button (click)="remove(d)"><mat-icon>favorite</mat-icon></button>
          </div>
        </div>
      </div>
      <div class="empty-state" *ngIf="!items.length">
        <mat-icon>favorite_border</mat-icon>
        <p>{{ 'PATIENT.NO_FAVORITES' | translate }}</p>
      </div>
    </div>
  `,
  styles: [`
    .page-shell { display: flex; flex-direction: column; gap: 1rem; }
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
        <section class="list-stats"><article class="stat-pill"><span class="stat-label">{{ 'COMMON.ALL' | translate }}</span><strong>{{ totalElements }}</strong></article></section>
        <section class="app-card table-card">
          <div class="estate-table-toolbar">
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
        <section class="list-stats"><article class="stat-pill"><span class="stat-label">{{ 'COMMON.ALL' | translate }}</span><strong>{{ totalElements }}</strong></article></section>
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
  imports: [NgFor, NgIf, RmsDatePipe, TranslateModule, MatCardModule, PageHeaderComponent, MatProgressSpinnerModule],
  template: `
    <app-page-header titleKey="NAV.MEDICAL_RECORDS"></app-page-header>
    <div *ngIf="loading" class="loading-wrap"><mat-spinner diameter="40"></mat-spinner></div>
    <div class="page-shell" *ngIf="!loading">
      <div class="app-card entity-card" *ngFor="let r of items">
        <h3>{{ r.titleAr }}</h3>
        <p class="muted">{{ r.recordType }} · {{ r.createdAt | rmsDate:'datetime' }}</p>
        <p>{{ r.descriptionAr }}</p>
      </div>
      <div class="empty-state" *ngIf="!items.length"><p>{{ 'PATIENT.NO_RECORDS' | translate }}</p></div>
    </div>
  `,
  styles: [`.page-shell { display: flex; flex-direction: column; gap: 1rem; } .entity-card { padding: 1rem; }`]
})
export class PatientMedicalRecordsComponent implements OnInit {
  items: MedicalRecord[] = [];
  loading = true;
  constructor(private readonly patientService: PatientService) {}
  ngOnInit(): void {
    this.patientService.getMedicalRecords(withPageParams(0, 50)).subscribe({
      next: (res) => { this.items = res.content; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
}

@Component({
  selector: 'app-patient-notifications',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, RmsDatePipe, TranslateModule, PageHeaderComponent, EmptyStateComponent, TablePagerComponent, MatProgressSpinnerModule],
  template: `
    <div class="app-page notifications-page">
      <app-page-header titleKey="NAV.NOTIFICATIONS"></app-page-header>
      <div *ngIf="listLoad.showInitialSpinner" class="loading-wrap"><mat-spinner diameter="40"></mat-spinner></div>
      <app-empty-state *ngIf="listLoad.showSurface && rows.length === 0 && !hasActiveFilters()" icon="notifications" titleKey="PATIENT.NO_NOTIFICATIONS"></app-empty-state>
      <div class="app-list-surface" *ngIf="listLoad.showSurface && (rows.length > 0 || hasActiveFilters())">
        <section class="list-stats"><article class="stat-pill"><span class="stat-label">{{ 'COMMON.ALL' | translate }}</span><strong>{{ totalElements }}</strong></article></section>
        <section class="app-card table-card">
          <div class="estate-table-toolbar">
            <label class="estate-search-inline"><span class="material-icons">search</span>
              <input [(ngModel)]="searchTerm" (ngModelChange)="onSearch()" [placeholder]="'NAV.NOTIFICATIONS' | translate">
            </label>
          </div>
          <div class="notif-row" *ngFor="let n of rows" [class.is-unread]="!n.readFlag" (click)="markRead(n)">
            <div class="notif-title">{{ n.titleAr }}</div>
            <div class="notif-body">{{ n.bodyAr }}</div>
            <div class="notif-date">{{ n.createdAt | rmsDate:'datetime' }}</div>
          </div>
          <app-table-pager [length]="totalElements" [pageSize]="pageSize" [pageIndex]="pageIndex" (pageIndexChange)="onPageChange($event)"/>
        </section>
      </div>
    </div>
  `
})
export class PatientNotificationsComponent implements OnInit {
  listLoad = new ListLoadController();
  rows: NotificationItem[] = [];
  pageIndex = 0;
  pageSize = DEFAULT_TABLE_PAGE_SIZE;
  totalElements = 0;
  searchTerm = '';
  private searchTimer?: ReturnType<typeof setTimeout>;
  constructor(private readonly patientService: PatientService) {}
  ngOnInit(): void { this.load(); }
  load(): void {
    this.listLoad.begin();
    this.patientService.getNotifications(withPageParams(this.pageIndex, this.pageSize, { q: this.searchTerm })).subscribe({
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
  markRead(n: NotificationItem): void {
    if (n.readFlag) return;
    this.patientService.markNotificationRead(n.id).subscribe({
      next: () => { n.readFlag = true; }
    });
  }
}
