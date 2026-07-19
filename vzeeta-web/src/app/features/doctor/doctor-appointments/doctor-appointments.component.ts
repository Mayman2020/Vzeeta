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
  selector: 'app-doctor-appointments',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, TranslateModule, MatButtonModule, MatIconModule, MatTooltipModule, RmsDatePipe, PageHeaderComponent, EmptyStateComponent, TablePagerComponent, MatProgressSpinnerModule],
  templateUrl: './doctor-appointments.component.html',
  styleUrls: ['./doctor-appointments.component.scss']
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
