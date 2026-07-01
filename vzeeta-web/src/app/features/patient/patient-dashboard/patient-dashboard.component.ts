import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { PatientService } from '../../../core/services/patient.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { Appointment } from '../../../core/models/appointment.model';
import { withPageParams } from '../../../core/utils/pagination.util';

import { StatCounterComponent } from '../../../shared/components/stat-counter/stat-counter.component';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink, MatButtonModule, MatIconModule, TranslateModule, LoadingSpinnerComponent, StatCounterComponent],
  template: `
    <div class="app-page dashboard-page" *ngIf="!loading; else loadingTpl">

      <!-- Welcome Banner -->
      <div class="welcome-banner">
        <div class="welcome-left">
          <div class="welcome-icon-wrap">
            <mat-icon>health_and_safety</mat-icon>
          </div>
          <div class="welcome-text">
            <h1 class="welcome-title">{{ 'PATIENT.WELCOME' | translate }}</h1>
            <p class="welcome-sub">{{ 'PATIENT.DASHBOARD_SUBTITLE' | translate }}</p>
          </div>
        </div>
        <a mat-flat-button class="book-now-btn" routerLink="/doctors">
          <mat-icon>add</mat-icon>
          {{ 'BOOKING.BOOK_NOW' | translate }}
        </a>
      </div>

      <!-- KPI Cards -->
      <div class="estate-stat-grid patient-kpi-grid">
        <article class="estate-stat-card navy" routerLink="/patient/appointments">
          <div class="estate-stat-top">
            <span class="estate-stat-label">{{ 'PATIENT.UPCOMING_APPOINTMENTS' | translate }}</span>
            <div class="estate-stat-icon"><span class="material-icons">event</span></div>
          </div>
          <div class="estate-stat-body">
            <app-stat-counter [value]="upcomingCount" tone="navy"></app-stat-counter>
          </div>
          <div class="estate-stat-foot">
            <span class="material-icons kpi-nav-arrow">arrow_forward</span>
            <span>{{ 'COMMON.UPCOMING' | translate }}</span>
          </div>
        </article>

        <article class="estate-stat-card teal" routerLink="/patient/favorites">
          <div class="estate-stat-top">
            <span class="estate-stat-label">{{ 'PATIENT.FAVORITE_DOCTORS' | translate }}</span>
            <div class="estate-stat-icon"><span class="material-icons">favorite</span></div>
          </div>
          <div class="estate-stat-body">
            <app-stat-counter [value]="favoritesCount" tone="teal"></app-stat-counter>
          </div>
          <div class="estate-stat-foot">
            <span class="material-icons kpi-nav-arrow">arrow_forward</span>
            <span>{{ 'COMMON.TOTAL' | translate }}</span>
          </div>
        </article>

        <article class="estate-stat-card gold" routerLink="/patient/prescriptions">
          <div class="estate-stat-top">
            <span class="estate-stat-label">{{ 'PATIENT.ACTIVE_PRESCRIPTIONS' | translate }}</span>
            <div class="estate-stat-icon"><span class="material-icons">medication</span></div>
          </div>
          <div class="estate-stat-body">
            <app-stat-counter [value]="prescriptionsCount" tone="gold"></app-stat-counter>
          </div>
          <div class="estate-stat-foot">
            <span class="material-icons kpi-nav-arrow">arrow_forward</span>
            <span>{{ 'COMMON.TOTAL' | translate }}</span>
          </div>
        </article>

        <article class="estate-stat-card" [class.danger]="unreadCount > 0" routerLink="/patient/notifications">
          <div class="estate-stat-top">
            <span class="estate-stat-label">{{ 'PATIENT.UNREAD_NOTIFICATIONS' | translate }}</span>
            <div class="estate-stat-icon"><span class="material-icons">notifications</span></div>
          </div>
          <div class="estate-stat-body">
            <app-stat-counter [value]="unreadCount" [tone]="unreadCount > 0 ? 'danger' : 'navy'"></app-stat-counter>
          </div>
          <div class="estate-stat-foot">
            <span class="material-icons kpi-nav-arrow">{{ unreadCount > 0 ? 'priority_high' : 'done_all' }}</span>
            <span>{{ (unreadCount > 0 ? 'COMMON.NEW' : 'COMMON.ALL_READ') | translate }}</span>
          </div>
        </article>
      </div>

      <!-- Quick Actions -->
      <div class="quick-section">
        <div class="section-header">
          <h2 class="section-title">{{ 'PATIENT.QUICK_ACTIONS' | translate }}</h2>
          <span class="section-badge">{{ 'COMMON.FAST_ACCESS' | translate }}</span>
        </div>
        <div class="quick-grid">
          <a routerLink="/doctors" class="quick-card q-blue">
            <span class="q-icon"><mat-icon>search</mat-icon></span>
            <span class="q-label">{{ 'HOME.SEARCH' | translate }}</span>
            <span class="q-desc">{{ 'PATIENT.QA_SEARCH_DESC' | translate }}</span>
          </a>
          <a routerLink="/patient/appointments" class="quick-card q-rose">
            <span class="q-icon"><mat-icon>event_note</mat-icon></span>
            <span class="q-label">{{ 'NAV.APPOINTMENTS' | translate }}</span>
            <span class="q-desc">{{ 'PATIENT.QA_APPT_DESC' | translate }}</span>
          </a>
          <a routerLink="/patient/medical-records" class="quick-card q-teal">
            <span class="q-icon"><mat-icon>folder_open</mat-icon></span>
            <span class="q-label">{{ 'NAV.MEDICAL_RECORDS' | translate }}</span>
            <span class="q-desc">{{ 'PATIENT.QA_RECORDS_DESC' | translate }}</span>
          </a>
          <a routerLink="/patient/prescriptions" class="quick-card q-purple">
            <span class="q-icon"><mat-icon>medication</mat-icon></span>
            <span class="q-label">{{ 'NAV.PRESCRIPTIONS' | translate }}</span>
            <span class="q-desc">{{ 'PATIENT.QA_RX_DESC' | translate }}</span>
          </a>
        </div>
      </div>

      <!-- Upcoming Appointments -->
      <div class="appt-section" *ngIf="upcomingAppointments.length > 0">
        <div class="section-header">
          <h2 class="section-title">{{ 'PATIENT.UPCOMING_APPOINTMENTS' | translate }}</h2>
          <a routerLink="/patient/appointments" class="see-all">
            {{ 'COMMON.SEE_ALL' | translate }}
            <mat-icon>chevron_right</mat-icon>
          </a>
        </div>
        <div class="appt-card-grid">
          <div class="appt-card" *ngFor="let a of upcomingAppointments">
            <div class="appt-avatar" [style.background]="avatarColor(a.doctorNameAr || 'D')">
              {{ initials(a.doctorNameAr || a.doctorNameEn) }}
            </div>
            <div class="appt-info">
              <div class="appt-doctor">{{ a.doctorNameAr || a.doctorNameEn || ('PATIENT.DOCTOR' | translate) }}</div>
              <div class="appt-meta">
                <span class="appt-time"><mat-icon>schedule</mat-icon> {{ a.startTime.substring(0, 5) }}</span>
                <span class="appt-date"><mat-icon>calendar_today</mat-icon> {{ a.appointmentDate }}</span>
              </div>
              <span class="appt-status" [attr.data-status]="a.status">{{ a.status }}</span>
            </div>
            <a routerLink="/patient/appointments" class="appt-view-btn">
              <mat-icon>arrow_forward</mat-icon>
            </a>
          </div>
        </div>
      </div>

      <!-- Empty state for appointments -->
      <div class="appt-empty" *ngIf="upcomingAppointments.length === 0">
        <div class="empty-icon"><mat-icon>event_busy</mat-icon></div>
        <h3>{{ 'PATIENT.NO_APPOINTMENTS' | translate }}</h3>
        <p>{{ 'PATIENT.NO_APPOINTMENTS_HINT' | translate }}</p>
        <a mat-flat-button class="book-now-btn" routerLink="/doctors">
          <mat-icon>search</mat-icon>
          {{ 'HOME.SEARCH' | translate }}
        </a>
      </div>
    </div>

    <ng-template #loadingTpl><app-loading-spinner [local]="true"></app-loading-spinner></ng-template>
  `,
  styles: [`
    /* Welcome Banner */
    .welcome-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 24px 28px;
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 60%, #1e40af 100%);
      border-radius: 16px;
      color: #fff;
    }
    .welcome-left { display: flex; align-items: center; gap: 16px; }
    .welcome-icon-wrap {
      width: 52px; height: 52px;
      background: rgba(255,255,255,0.18);
      border-radius: 14px;
      display: grid; place-items: center;
      mat-icon { font-size: 28px; width: 28px; height: 28px; color: #fff; }
    }
    .welcome-title { margin: 0 0 4px; font-size: 1.4rem; font-weight: 800; color: #fff; }
    .welcome-sub { margin: 0; color: rgba(255,255,255,0.8); font-size: 0.9rem; }
    .book-now-btn {
      background: #fff !important; color: #2563eb !important;
      border-radius: 10px !important; font-weight: 700 !important;
      min-height: 44px; padding: 0 20px;
      display: flex; align-items: center; gap: 6px;
    }

    /* Quick Actions */
    .section-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 14px;
    }
    .section-title { margin: 0; font-size: 1.05rem; font-weight: 800; color: #0f172a; }
    .section-badge {
      font-size: 0.75rem; color: #64748b;
      background: #f1f5f9; padding: 3px 10px; border-radius: 999px;
    }
    .see-all {
      display: flex; align-items: center; gap: 2px;
      color: #2563eb; font-size: 0.85rem; font-weight: 600;
      text-decoration: none;
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }
    .quick-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
    }
    .quick-card {
      display: flex; flex-direction: column; align-items: flex-start; gap: 8px;
      padding: 20px; border-radius: 14px; text-decoration: none;
      transition: transform 0.18s, box-shadow 0.18s;
      position: relative; overflow: hidden;
    }
    .quick-card:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(0,0,0,0.12); }
    .quick-card.q-blue { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #fff; }
    .quick-card.q-rose { background: linear-gradient(135deg, #db2777, #be185d); color: #fff; }
    .quick-card.q-teal { background: linear-gradient(135deg, #059669, #047857); color: #fff; }
    .quick-card.q-purple { background: linear-gradient(135deg, #7c3aed, #6d28d9); color: #fff; }
    .q-icon {
      width: 44px; height: 44px; background: rgba(255,255,255,0.2);
      border-radius: 12px; display: grid; place-items: center;
      mat-icon { font-size: 22px; width: 22px; height: 22px; color: #fff; }
    }
    .q-label { font-size: 0.95rem; font-weight: 700; color: #fff; }
    .q-desc { font-size: 0.78rem; color: rgba(255,255,255,0.75); line-height: 1.4; }

    /* Appointments grid */
    .appt-card-grid { display: flex; flex-direction: column; gap: 10px; }
    .appt-card {
      display: flex; align-items: center; gap: 14px;
      padding: 14px 16px;
      background: #fff; border: 1px solid #e2e8f0; border-radius: 12px;
      box-shadow: 0 1px 6px rgba(15,23,42,0.04);
      transition: box-shadow 0.18s;
    }
    .appt-card:hover { box-shadow: 0 6px 18px rgba(15,23,42,0.09); }
    .appt-avatar {
      width: 44px; height: 44px; border-radius: 50%;
      display: grid; place-items: center; flex-shrink: 0;
      font-size: 0.9rem; font-weight: 800; color: #fff;
    }
    .appt-info { flex: 1; }
    .appt-doctor { font-weight: 700; color: #0f172a; font-size: 0.95rem; }
    .appt-meta {
      display: flex; align-items: center; gap: 12px;
      margin-top: 4px; color: #64748b; font-size: 0.8rem;
      span { display: flex; align-items: center; gap: 3px; }
      mat-icon { font-size: 14px; width: 14px; height: 14px; }
    }
    .appt-status {
      padding: 3px 10px; border-radius: 999px;
      font-size: 0.75rem; font-weight: 600;
    }
    [data-status="PENDING"] { background: #fef9c3; color: #ca8a04; }
    [data-status="CONFIRMED"] { background: #dcfce7; color: #16a34a; }
    [data-status="COMPLETED"] { background: #dbeafe; color: #2563eb; }
    [data-status="CANCELLED"] { background: #fee2e2; color: #dc2626; }
    [data-status="RESCHEDULED"] { background: #e0f2fe; color: #0284c7; }
    .appt-view-btn {
      width: 36px; height: 36px; background: #f1f5f9;
      border-radius: 10px; display: grid; place-items: center;
      color: #64748b; text-decoration: none; flex-shrink: 0;
      transition: background 0.15s, color 0.15s;
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }
    .appt-view-btn:hover { background: #2563eb; color: #fff; }

    /* Empty state */
    .appt-empty {
      text-align: center; padding: 48px 24px;
      background: #fff; border: 1px solid #e2e8f0; border-radius: 16px;
    }
    .empty-icon {
      width: 72px; height: 72px; margin: 0 auto 16px;
      background: #f1f5f9; border-radius: 50%;
      display: grid; place-items: center;
      mat-icon { font-size: 36px; width: 36px; height: 36px; color: #94a3b8; }
    }
    .appt-empty h3 { margin: 0 0 8px; color: #0f172a; font-size: 1.1rem; }
    .appt-empty p { margin: 0 0 20px; color: #64748b; }

    @media (max-width: 900px) {
      .med-kpi-grid { grid-template-columns: repeat(2, 1fr); }
      .quick-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 560px) {
      .welcome-banner { flex-direction: column; align-items: flex-start; }
      .med-kpi-grid { grid-template-columns: 1fr 1fr; }
      .quick-grid { grid-template-columns: 1fr 1fr; }
    }
  `]
})
export class PatientDashboardComponent implements OnInit {
  loading = true;
  upcomingCount = 0;
  favoritesCount = 0;
  prescriptionsCount = 0;
  unreadCount = 0;
  upcomingAppointments: Appointment[] = [];

  private readonly AVATAR_COLORS = [
    '#2563eb', '#7c3aed', '#db2777', '#059669',
    '#d97706', '#0284c7', '#dc2626', '#0891b2'
  ];

  constructor(
    private readonly patientService: PatientService,
    private readonly appointmentService: AppointmentService
  ) {}

  ngOnInit(): void {
    const today = new Date().toISOString().split('T')[0];
    this.patientService.getAppointments(withPageParams(0, 100)).subscribe({
      next: (page) => {
        const appts = page.content;
        this.upcomingAppointments = appts
          .filter((a) => a.appointmentDate >= today && a.status !== 'CANCELLED')
          .slice(0, 5);
        this.upcomingCount = this.upcomingAppointments.length;

        this.patientService.getFavorites().subscribe({
          next: (favs) => {
            this.favoritesCount = favs.length;
            this.patientService.getPrescriptions(withPageParams(0, 1)).subscribe({
              next: (rxPage) => {
                this.prescriptionsCount = rxPage.totalElements;
                this.patientService.getNotifications(withPageParams(0, 100)).subscribe({
                  next: (notifPage) => {
                    this.unreadCount = notifPage.content.filter((n) => !n.readFlag).length;
                    this.loading = false;
                  },
                  error: () => { this.loading = false; }
                });
              },
              error: () => { this.loading = false; }
            });
          },
          error: () => { this.loading = false; }
        });
      },
      error: () => { this.loading = false; }
    });
  }

  initials(name?: string): string {
    if (!name) return '?';
    return name.split(' ').slice(0, 2).map((p) => p[0]).join('').toUpperCase();
  }

  avatarColor(name: string): string {
    const idx = (name?.charCodeAt(0) ?? 0) % this.AVATAR_COLORS.length;
    return this.AVATAR_COLORS[idx];
  }
}
