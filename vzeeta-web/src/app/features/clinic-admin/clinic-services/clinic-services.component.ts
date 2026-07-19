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
  selector: 'app-clinic-services',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, TranslateModule, MatButtonModule, MatIconModule, PageHeaderComponent, EmptyStateComponent, TablePagerComponent, MatProgressSpinnerModule],
  templateUrl: './clinic-services.component.html'
})
export class ClinicServicesComponent implements OnInit {
  listLoad = new ListLoadController();
  rows: ClinicServiceItem[] = [];
  pageIndex = 0;
  pageSize = DEFAULT_TABLE_PAGE_SIZE;
  totalElements = 0;
  searchTerm = '';
  private searchTimer?: ReturnType<typeof setTimeout>;

  constructor(
    private readonly clinicAdmin: ClinicAdminService,
    private readonly dialog: MatDialog
  ) {}

  ngOnInit(): void { this.load(); }
  load(): void {
    this.listLoad.begin();
    this.clinicAdmin.getServices(withPageParams(this.pageIndex, this.pageSize, { q: this.searchTerm })).subscribe({
      next: (res) => { this.rows = res.content; this.totalElements = res.totalElements; this.listLoad.end(); },
      error: () => { this.rows = []; this.totalElements = 0; this.listLoad.end(); }
    });
  }
  openCreate(): void {
    this.dialog.open(ClinicServiceDialogComponent, { ...ESTATE_DIALOG_OPTS, width: '520px' })
      .afterClosed().subscribe((ok) => { if (ok) this.load(); });
  }
  onPageChange(i: number): void { this.pageIndex = i; this.load(); }
  onSearch(): void { clearTimeout(this.searchTimer); this.searchTimer = setTimeout(() => { this.pageIndex = 0; this.load(); }, 300); }
  hasActiveFilters(): boolean { return !!this.searchTerm?.trim(); }
}
