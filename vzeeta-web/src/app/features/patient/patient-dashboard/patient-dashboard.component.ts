import { Component, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FeatureShellComponent } from '../../../shared/components/feature-shell/feature-shell.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { NgIf } from '@angular/common';
import { PatientService } from '../../../core/services/patient.service';
import { withPageParams } from '../../../core/utils/pagination.util';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [FeatureShellComponent, TranslateModule, LoadingSpinnerComponent, NgIf],
  template: `
    <app-loading-spinner *ngIf="loading"></app-loading-spinner>
    <app-feature-shell
      *ngIf="!loading"
      titleKey="PATIENT.DASHBOARD_TITLE"
      subtitleKey="PATIENT.DASHBOARD_SUBTITLE"
      [stats]="stats"
      [empty]="false">
      <p>{{ 'PATIENT.WELCOME' | translate }}</p>
    </app-feature-shell>
  `
})
export class PatientDashboardComponent implements OnInit {
  loading = true;
  stats: { value: string | number; labelKey: string }[] = [];

  constructor(private readonly patientService: PatientService) {}

  ngOnInit(): void {
    const today = new Date().toISOString().split('T')[0];
    this.patientService.getAppointments(withPageParams(0, 100)).subscribe({
      next: (page) => {
        const appts = page.content;
        const upcoming = appts.filter((a) => a.appointmentDate >= today && a.status !== 'CANCELLED').length;
        this.patientService.getFavorites().subscribe({
          next: (favs) => {
            this.patientService.getPrescriptions(withPageParams(0, 1)).subscribe({
              next: (rxPage) => {
                this.patientService.getNotifications(withPageParams(0, 100)).subscribe({
                  next: (notifPage) => {
                    const unread = notifPage.content.filter((n) => !n.readFlag).length;
                    this.stats = [
                      { value: upcoming, labelKey: 'PATIENT.UPCOMING_APPOINTMENTS' },
                      { value: favs.length, labelKey: 'PATIENT.FAVORITE_DOCTORS' },
                      { value: rxPage.totalElements, labelKey: 'PATIENT.ACTIVE_PRESCRIPTIONS' },
                      { value: unread, labelKey: 'PATIENT.UNREAD_NOTIFICATIONS' }
                    ];
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
}
