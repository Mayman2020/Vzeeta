import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, SlicePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
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
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { FeatureShellComponent } from '../../../shared/components/feature-shell/feature-shell.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { TablePagerComponent } from '../../../shared/components/table-pager/table-pager.component';
import { ListLoadController } from '../../../shared/utils/list-load.util';
import { DEFAULT_TABLE_PAGE_SIZE, withPageParams } from '../../../core/utils/pagination.util';
import { DoctorPortalService, DoctorAvailability } from '../../../core/services/doctor-portal.service';
import { Appointment } from '../../../core/models/appointment.model';
import { SnackService } from '../../../core/services/snack.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { RmsDatePipe } from '../../../shared/pipes/rms-date.pipe';

const DAY_NAME_KEYS = ['COMMON.DAY_SUN', 'COMMON.DAY_MON', 'COMMON.DAY_TUE', 'COMMON.DAY_WED', 'COMMON.DAY_THU', 'COMMON.DAY_FRI', 'COMMON.DAY_SAT'];
const APPOINTMENT_STATUSES = ['PENDING', 'CONFIRMED', 'RESCHEDULED', 'COMPLETED', 'CANCELLED', 'REJECTED'] as const;


@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [NgFor, NgIf, SlicePipe, TranslateModule, MatProgressSpinnerModule, MatButtonModule, MatIconModule, RmsDatePipe],
  templateUrl: './doctor-dashboard.component.html',
  styleUrls: ['./doctor-dashboard.component.scss']
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
