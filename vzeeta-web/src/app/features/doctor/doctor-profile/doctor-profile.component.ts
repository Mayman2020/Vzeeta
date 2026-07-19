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
  selector: 'app-doctor-profile',
  standalone: true,
  imports: [NgIf, TranslateModule, MatCardModule, MatButtonModule, PageHeaderComponent, MatProgressSpinnerModule, RouterLink],
  templateUrl: './doctor-profile.component.html',
  styleUrls: ['./doctor-profile.component.scss']
})
export class DoctorProfileComponent implements OnInit {
  loading = true;
  profile: Record<string, unknown> = {};
  constructor(
    private readonly doctorPortal: DoctorPortalService,
    readonly i18n: I18nService
  ) {}
  ngOnInit(): void {
    this.doctorPortal.getProfile().subscribe({
      next: (p) => { this.profile = p; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
  get displayName(): string {
    const ar = String(this.profile['fullNameAr'] ?? '');
    const en = String(this.profile['fullNameEn'] ?? '');
    return this.i18n.currentLang === 'ar' ? (ar || en) : (en || ar);
  }
}
