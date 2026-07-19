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
import { DeleteConfirmService } from '../../../core/services/delete-confirm.service';
import { RmsDatePipe } from '../../../shared/pipes/rms-date.pipe';
import { formatApiDate } from '../../../core/utils/date-value.utils';
import { environment } from '../../../../environments/environment';


@Component({
  selector: 'app-patient-favorites',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink, TranslateModule, MatCardModule, MatButtonModule, MatIconModule, MatTooltipModule, PageHeaderComponent, MatProgressSpinnerModule],
  templateUrl: './patient-favorites.component.html',
  styleUrls: ['./patient-favorites.component.scss']
})
export class PatientFavoritesComponent implements OnInit {
  items: Doctor[] = [];
  loading = true;

  constructor(
    private readonly patientService: PatientService,
    private readonly snack: SnackService,
    private readonly i18n: I18nService,
    private readonly deleteConfirm: DeleteConfirmService
  ) {}

  ngOnInit(): void {
    this.patientService.getFavorites().subscribe({
      next: (items) => { this.items = items; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  remove(d: Doctor): void {
    this.deleteConfirm.openDeleteConfirm({ messageKey: 'PATIENT.REMOVE_FAVORITE_CONFIRM' }).subscribe((ok) => {
      if (!ok) return;
      this.patientService.removeFavorite(d.id).subscribe({
        next: () => {
          this.items = this.items.filter((x) => x.id !== d.id);
          this.snack.success(this.i18n.instant('PATIENT.REMOVED_FAVORITE'));
        }
      });
    });
  }
}
