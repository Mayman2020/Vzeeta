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
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { FeatureShellComponent } from '../../../shared/components/feature-shell/feature-shell.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { TablePagerComponent } from '../../../shared/components/table-pager/table-pager.component';
import { ListLoadController } from '../../../shared/utils/list-load.util';
import { DEFAULT_TABLE_PAGE_SIZE, withPageParams } from '../../../core/utils/pagination.util';
import { RmsDatePipe } from '../../../shared/pipes/rms-date.pipe';
import { DateFieldComponent } from '../../../shared/components/date-field/date-field.component';
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
} from '../../../core/services/clinic-admin.service';
import { Appointment } from '../../../core/models/appointment.model';
import { SnackService } from '../../../core/services/snack.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { ClinicDoctorDialogComponent } from '../clinic-doctor-dialog/clinic-doctor-dialog.component';
import { ClinicBranchDialogComponent } from '../clinic-branch-dialog/clinic-branch-dialog.component';
import { ClinicServiceDialogComponent } from '../clinic-service-dialog/clinic-service-dialog.component';

const ESTATE_DIALOG_OPTS = {
  width: '560px',
  maxWidth: '95vw',
  panelClass: 'app-dialog-panel',
  disableClose: true
} as const;


@Component({
  selector: 'app-clinic-admin-dashboard',
  standalone: true,
  imports: [NgFor, NgIf, SlicePipe, RmsDatePipe, TranslateModule, MatProgressSpinnerModule, MatButtonModule, MatIconModule],
  templateUrl: './clinic-admin-dashboard.component.html',
  styleUrls: ['./clinic-admin-dashboard.component.scss']
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
