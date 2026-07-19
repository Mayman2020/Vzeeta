import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { TablePagerComponent } from '../../../shared/components/table-pager/table-pager.component';
import { TableExportToolbarComponent, ExportColumn } from '../../../shared/components/table-export-toolbar/table-export-toolbar.component';
import { ListLoadController } from '../../../shared/utils/list-load.util';
import { DEFAULT_TABLE_PAGE_SIZE, withPageParams } from '../../../core/utils/pagination.util';
import { ClinicAdminService, ClinicDoctor } from '../../../core/services/clinic-admin.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { ClinicDoctorDialogComponent } from '../clinic-doctor-dialog/clinic-doctor-dialog.component';

const ESTATE_DIALOG_OPTS = {
  width: '560px',
  maxWidth: '95vw',
  panelClass: 'app-dialog-panel',
  disableClose: true
} as const;


@Component({
  selector: 'app-clinic-doctors',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, TranslateModule, MatButtonModule, MatIconModule, MatTooltipModule, PageHeaderComponent, EmptyStateComponent, TablePagerComponent, TableExportToolbarComponent, MatProgressSpinnerModule],
  templateUrl: './clinic-doctors.component.html'
})
export class ClinicDoctorsComponent implements OnInit {
  listLoad = new ListLoadController();
  rows: ClinicDoctor[] = [];
  pageIndex = 0;
  pageSize = DEFAULT_TABLE_PAGE_SIZE;
  totalElements = 0;
  searchTerm = '';
  private searchTimer?: ReturnType<typeof setTimeout>;

  constructor(
    private readonly clinicAdmin: ClinicAdminService,
    private readonly dialog: MatDialog,
    private readonly i18n: I18nService
  ) {}

  readonly exportColumns: ExportColumn<ClinicDoctor>[] = [
    { header: 'Name', value: (row) => row.user?.fullNameAr || row.user?.fullNameEn || `#${row.id}` },
    { header: 'Email', value: (row) => row.user?.email ?? '-' },
    { header: 'Phone', value: (row) => row.user?.phone ?? '-' },
    { header: 'Title', value: 'titleAr' },
    { header: 'Fee', value: 'consultationFee' },
    { header: 'Verified', value: (row) => row.verified ? 'Yes' : 'No' }
  ];

  loadExportRows = (): Promise<ClinicDoctor[]> =>
    firstValueFrom(
      this.clinicAdmin.getDoctors(withPageParams(0, Math.max(this.totalElements, 1), { q: this.searchTerm }))
    ).then((res) => res.content);

  ngOnInit(): void { this.load(); }

  load(): void {
    this.listLoad.begin();
    this.clinicAdmin.getDoctors(withPageParams(this.pageIndex, this.pageSize, { q: this.searchTerm })).subscribe({
      next: (res) => { this.rows = res.content; this.totalElements = res.totalElements; this.listLoad.end(); },
      error: () => { this.rows = []; this.totalElements = 0; this.listLoad.end(); }
    });
  }

  openCreate(): void {
    this.dialog.open(ClinicDoctorDialogComponent, {
      ...ESTATE_DIALOG_OPTS,
      data: { mode: 'create' }
    }).afterClosed().subscribe((ok) => { if (ok) this.load(); });
  }

  openEdit(d: ClinicDoctor): void {
    this.dialog.open(ClinicDoctorDialogComponent, {
      ...ESTATE_DIALOG_OPTS,
      data: { mode: 'edit', doctor: d }
    }).afterClosed().subscribe((ok) => { if (ok) this.load(); });
  }

  onPageChange(i: number): void { this.pageIndex = i; this.load(); }
  onSearch(): void {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => { this.pageIndex = 0; this.load(); }, 300);
  }
  hasActiveFilters(): boolean { return !!this.searchTerm?.trim(); }
}
