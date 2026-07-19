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
  selector: 'app-patient-medical-records',
  standalone: true,
  imports: [NgFor, NgIf, RmsDatePipe, TranslateModule, MatCardModule, MatButtonModule, MatIconModule, PageHeaderComponent, MatProgressSpinnerModule, TablePagerComponent],
  templateUrl: './patient-medical-records.component.html',
  styleUrls: ['./patient-medical-records.component.scss']
})
export class PatientMedicalRecordsComponent implements OnInit {
  listLoad = new ListLoadController();
  items: MedicalRecord[] = [];
  pageIndex = 0;
  pageSize = DEFAULT_TABLE_PAGE_SIZE;
  totalElements = 0;

  constructor(
    private readonly patientService: PatientService,
    private readonly i18n: I18nService
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.listLoad.begin();
    this.patientService.getMedicalRecords(withPageParams(this.pageIndex, this.pageSize)).subscribe({
      next: (res) => {
        this.items = res.content;
        this.totalElements = res.totalElements;
        this.listLoad.end();
      },
      error: () => {
        this.items = [];
        this.totalElements = 0;
        this.listLoad.end();
      }
    });
  }

  onPageChange(index: number): void {
    this.pageIndex = index;
    this.load();
  }

  recordTitle(r: MedicalRecord): string {
    return this.i18n.currentLang === 'ar' ? r.titleAr : (r.titleEn || r.titleAr);
  }

  recordDescription(r: MedicalRecord): string {
    return this.i18n.currentLang === 'ar' ? (r.descriptionAr ?? '') : (r.descriptionEn || r.descriptionAr || '');
  }

  recordIcon(type: string): string {
    const map: Record<string, string> = {
      DIAGNOSIS: 'diagnosis', PRESCRIPTION: 'medication', LAB: 'science', IMAGING: 'radiology'
    };
    return map[type?.toUpperCase()] ?? 'description';
  }

  iconClass(type: string): string {
    const map: Record<string, string> = {
      DIAGNOSIS: 'diagnosis', PRESCRIPTION: 'prescription', LAB: 'lab', IMAGING: 'imaging'
    };
    return map[type?.toUpperCase()] ?? 'default';
  }
}
