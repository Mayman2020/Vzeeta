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
  templateUrl: './patient-dashboard.component.html',
  styleUrls: ['./patient-dashboard.component.scss']
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
