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
  selector: 'app-patient-notifications',
  standalone: true,
  imports: [
    NgFor, NgIf, NgClass, RmsDatePipe, TranslateModule, MatButtonModule, MatTabsModule, MatTooltipModule,
    PageHeaderComponent, EmptyStateComponent, TablePagerComponent, MatProgressSpinnerModule
  ],
  templateUrl: './patient-notifications.component.html'
})
export class PatientNotificationsComponent implements OnInit {
  listLoad = new ListLoadController();
  rows: NotificationItem[] = [];
  pageIndex = 0;
  readonly pageSize = 5;
  totalElements = 0;
  tabIndex = 0;
  private activeScope: 'recent' | 'older' = 'recent';

  constructor(
    private readonly patientService: PatientService,
    private readonly notificationService: NotificationService,
    private readonly i18n: I18nService,
    private readonly router: Router
  ) {}

  ngOnInit(): void { this.load(); }

  onTabChange(index: number): void {
    this.tabIndex = index;
    this.activeScope = index === 0 ? 'recent' : 'older';
    this.pageIndex = 0;
    this.load();
  }

  notificationTitle(n: NotificationItem): string {
    return this.i18n.currentLang === 'ar' ? n.titleAr : (n.titleEn || n.titleAr);
  }

  notificationBody(n: NotificationItem): string {
    return this.i18n.currentLang === 'ar' ? (n.bodyAr ?? '') : (n.bodyEn || n.bodyAr || '');
  }

  notificationIcon(n: NotificationItem): string {
    const type = (n.type || '').toUpperCase();
    if (type.includes('APPOINTMENT') || type.includes('BOOKING')) return 'event';
    if (type.includes('PRESCRIPTION') || type.includes('RX')) return 'medication';
    if (type.includes('LAB')) return 'science';
    if (type.includes('REMINDER')) return 'alarm';
    if (type.includes('VIDEO')) return 'videocam';
    return 'notifications';
  }

  iconTone(n: NotificationItem): string {
    const type = (n.type || '').toUpperCase();
    if (type.includes('APPOINTMENT') || type.includes('BOOKING')) return 'appointment';
    if (type.includes('PRESCRIPTION') || type.includes('RX')) return 'prescription';
    if (type.includes('LAB')) return 'lab';
    if (type.includes('REMINDER')) return 'reminder';
    return '';
  }

  load(): void {
    this.listLoad.begin();
    this.patientService.getNotifications(withPageParams(this.pageIndex, this.pageSize, { scope: this.activeScope })).subscribe({
      next: (res) => {
        this.rows = res.content;
        this.totalElements = res.totalElements;
        this.listLoad.end();
      },
      error: () => {
        this.rows = [];
        this.totalElements = 0;
        this.listLoad.end();
      }
    });
  }

  onPageChange(i: number): void {
    this.pageIndex = i;
    this.load();
  }

  markAllRead(): void {
    this.patientService.markAllNotificationsRead().subscribe({
      next: () => {
        this.rows.forEach((n) => { n.readFlag = true; });
        this.notificationService.setUnreadCount(0);
        this.load();
      }
    });
  }

  open(n: NotificationItem): void {
    if (!n.readFlag) {
      this.patientService.markNotificationRead(n.id).subscribe({
        next: () => {
          n.readFlag = true;
          this.notificationService.refreshUnreadCount();
        }
      });
    }
    const ref = n.referenceType?.toUpperCase() ?? '';
    if (ref.includes('APPOINTMENT')) {
      void this.router.navigate(['/patient/appointments']);
      return;
    }
    if (ref.includes('PRESCRIPTION')) {
      void this.router.navigate(['/patient/prescriptions']);
      return;
    }
    if (ref.includes('LAB')) {
      void this.router.navigate(['/patient/lab-results']);
    }
  }
}
