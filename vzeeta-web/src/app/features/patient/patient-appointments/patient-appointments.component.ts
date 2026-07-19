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
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { TablePagerComponent } from '../../../shared/components/table-pager/table-pager.component';
import { DateFieldComponent } from '../../../shared/components/date-field/date-field.component';
import { ListLoadController } from '../../../shared/utils/list-load.util';
import { DEFAULT_TABLE_PAGE_SIZE, withPageParams } from '../../../core/utils/pagination.util';
import { PatientService } from '../../../core/services/patient.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { Appointment } from '../../../core/models/appointment.model';
import { Doctor } from '../../../core/models/doctor.model';
import { LabResult, MedicalRecord, NotificationItem, Prescription } from '../../../core/services/patient.service';
import { SnackService } from '../../../core/services/snack.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { RmsDatePipe } from '../../../shared/pipes/rms-date.pipe';
import { formatApiDate } from '../../../core/utils/date-value.utils';
import { environment } from '../../../../environments/environment';


@Component({
  selector: 'app-patient-appointments',
  standalone: true,
  imports: [
    NgFor, NgIf, FormsModule, RouterLink, TranslateModule, MatButtonModule, MatChipsModule, MatCardModule,
    MatFormFieldModule, MatInputModule, RmsDatePipe, DateFieldComponent,
    PageHeaderComponent, EmptyStateComponent, TablePagerComponent, MatProgressSpinnerModule
  ],
  templateUrl: './patient-appointments.component.html',
  styleUrls: ['./patient-appointments.component.scss']
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
