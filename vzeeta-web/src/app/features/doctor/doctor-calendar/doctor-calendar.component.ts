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
  selector: 'app-doctor-calendar',
  standalone: true,
  imports: [
    NgFor, NgIf, ReactiveFormsModule, TranslateModule, MatCardModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatCheckboxModule,
    PageHeaderComponent, MatProgressSpinnerModule, MatIconModule
  ],
  templateUrl: './doctor-calendar.component.html',
  styleUrls: ['./doctor-calendar.component.scss']
})
export class DoctorCalendarComponent implements OnInit {
  slots: DoctorAvailability[] = [];
  loading = true;
  saving = false;
  showForm = false;
  get dayOptions() {
    return DAY_NAME_KEYS.map((key, value) => ({ value, label: this.i18n.instant(key) }));
  }
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
        this.showForm = false;
        this.load();
      },
      error: () => { this.saving = false; }
    });
  }

  slotsForDay(dayOfWeek: number): DoctorAvailability[] {
    return this.slots.filter(s => s.dayOfWeek === dayOfWeek);
  }

  dayName(d: number): string { return this.i18n.instant(DAY_NAME_KEYS[d] ?? 'COMMON.DAY_SUN'); }
  formatTime(t: string): string { return (t ?? '').substring(0, 5); }
}
