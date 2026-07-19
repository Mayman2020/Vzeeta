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
  selector: 'app-clinic-lab-results',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, ReactiveFormsModule, TranslateModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatCardModule, RmsDatePipe, DateFieldComponent, PageHeaderComponent, EmptyStateComponent, TablePagerComponent, MatProgressSpinnerModule],
  templateUrl: './clinic-lab-results.component.html',
  styleUrls: ['./clinic-lab-results.component.scss']
})
export class ClinicLabResultsComponent implements OnInit {
  listLoad = new ListLoadController();
  rows: ClinicLabResult[] = [];
  pageIndex = 0;
  pageSize = DEFAULT_TABLE_PAGE_SIZE;
  totalElements = 0;
  searchTerm = '';
  showForm = false;
  saving = false;
  labForm: FormGroup;
  private searchTimer?: ReturnType<typeof setTimeout>;
  constructor(
    fb: FormBuilder,
    private readonly clinicAdmin: ClinicAdminService,
    private readonly snack: SnackService,
    private readonly i18n: I18nService
  ) {
    this.labForm = fb.group({
      patientId: [null, Validators.required],
      testNameAr: ['', Validators.required],
      testNameEn: [''],
      resultSummary: [''],
      resultDate: ['', Validators.required]
    });
  }
  ngOnInit(): void { this.load(); }
  load(): void {
    this.listLoad.begin();
    this.clinicAdmin.getLabResults(withPageParams(this.pageIndex, this.pageSize, { q: this.searchTerm })).subscribe({
      next: (res) => { this.rows = res.content; this.totalElements = res.totalElements; this.listLoad.end(); },
      error: () => { this.rows = []; this.totalElements = 0; this.listLoad.end(); }
    });
  }
  submitLabResult(): void {
    if (this.labForm.invalid || this.saving) return;
    this.saving = true;
    const value = this.labForm.getRawValue();
    this.clinicAdmin.createLabResult({
      patientId: Number(value.patientId),
      testNameAr: value.testNameAr,
      testNameEn: value.testNameEn,
      resultSummary: value.resultSummary,
      resultDate: value.resultDate
    }).subscribe({
      next: () => {
        this.snack.success(this.i18n.instant('COMMON.SAVE'));
        this.saving = false;
        this.showForm = false;
        this.labForm.reset();
        this.load();
      },
      error: () => { this.saving = false; }
    });
  }
  onPageChange(i: number): void { this.pageIndex = i; this.load(); }
  onSearch(): void { clearTimeout(this.searchTimer); this.searchTimer = setTimeout(() => { this.pageIndex = 0; this.load(); }, 300); }
  hasActiveFilters(): boolean { return !!this.searchTerm?.trim(); }
}
