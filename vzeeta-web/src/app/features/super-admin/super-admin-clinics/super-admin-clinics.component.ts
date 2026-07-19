import { Component, OnInit } from '@angular/core';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { TablePagerComponent } from '../../../shared/components/table-pager/table-pager.component';
import { TableExportToolbarComponent, ExportColumn } from '../../../shared/components/table-export-toolbar/table-export-toolbar.component';
import { ListLoadController } from '../../../shared/utils/list-load.util';
import { DEFAULT_TABLE_PAGE_SIZE, withPageParams } from '../../../core/utils/pagination.util';
import { SuperAdminService, AdminClinic } from '../../../core/services/super-admin.service';
import { SnackService } from '../../../core/services/snack.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ClinicDialogComponent } from '../clinic-dialog/clinic-dialog.component';


@Component({
  selector: 'app-super-admin-clinics',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, FormsModule, TranslateModule, MatButtonModule, MatIconModule, PageHeaderComponent, EmptyStateComponent, TablePagerComponent, TableExportToolbarComponent, MatProgressSpinnerModule, MatTooltipModule],
  templateUrl: './super-admin-clinics.component.html'
})
export class SuperAdminClinicsComponent implements OnInit {
  listLoad = new ListLoadController();
  rows: AdminClinic[] = [];
  pageIndex = 0;
  pageSize = DEFAULT_TABLE_PAGE_SIZE;
  totalElements = 0;
  searchTerm = '';
  private searchTimer?: ReturnType<typeof setTimeout>;
  private readonly dialogConfig = {
    width: '560px',
    maxWidth: '95vw',
    panelClass: 'app-dialog-panel',
    disableClose: true
  } as const;

  constructor(
    private readonly admin: SuperAdminService,
    private readonly snack: SnackService,
    private readonly i18n: I18nService,
    private readonly dialog: MatDialog
  ) {}

  readonly exportColumns: ExportColumn<AdminClinic>[] = [
    { header: 'Name (AR)', value: 'nameAr' },
    { header: 'Name (EN)', value: (row) => row.nameEn ?? '-' },
    { header: 'Email', value: (row) => row.email ?? '-' },
    { header: 'Phone', value: (row) => row.phone ?? '-' },
    { header: 'Active', value: (row) => row.active ? 'Yes' : 'No' },
    { header: 'Verified', value: (row) => row.verified ? 'Yes' : 'No' }
  ];

  loadExportRows = (): Promise<AdminClinic[]> =>
    firstValueFrom(
      this.admin.getClinics(withPageParams(0, Math.max(this.totalElements, 1), { q: this.searchTerm }))
    ).then((res) => res.content);
  ngOnInit(): void { this.load(); }
  load(): void {
    this.listLoad.begin();
    this.admin.getClinics(withPageParams(this.pageIndex, this.pageSize, { q: this.searchTerm })).subscribe({
      next: (res) => { this.rows = res.content; this.totalElements = res.totalElements; this.listLoad.end(); },
      error: () => { this.rows = []; this.totalElements = 0; this.listLoad.end(); }
    });
  }
  openCreate(): void {
    this.dialog.open(ClinicDialogComponent, {
      ...this.dialogConfig,
      data: { clinic: null }
    }).afterClosed().subscribe((ok) => { if (ok) this.load(); });
  }
  openEdit(c: AdminClinic): void {
    this.dialog.open(ClinicDialogComponent, {
      ...this.dialogConfig,
      data: { clinic: c }
    }).afterClosed().subscribe((ok) => { if (ok) this.load(); });
  }
  confirmDeactivate(c: AdminClinic): void {
    if (!c.active) {
      this.snack.error(this.i18n.instant('ADMIN.CLINIC_ALREADY_INACTIVE'));
      return;
    }
    this.dialog.open(ConfirmDialogComponent, {
      width: '440px',
      panelClass: 'app-dialog-panel',
      data: {
        title: 'ACTIONS.DELETE',
        message: 'ADMIN.DEACTIVATE_CLINIC_CONFIRM',
        danger: true,
        confirmLabel: 'ACTIONS.DELETE'
      }
    }).afterClosed().subscribe((ok) => {
      if (!ok) return;
      this.admin.saveClinic({ ...c, active: false }).subscribe({
        next: () => {
          this.snack.success(this.i18n.instant('ADMIN.CLINIC_SAVED'));
          this.load();
        }
      });
    });
  }
  onPageChange(i: number): void { this.pageIndex = i; this.load(); }
  onSearch(): void { clearTimeout(this.searchTimer); this.searchTimer = setTimeout(() => { this.pageIndex = 0; this.load(); }, 300); }
  hasActiveFilters(): boolean { return !!this.searchTerm?.trim(); }
}
