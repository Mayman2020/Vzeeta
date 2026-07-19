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
import { SuperAdminService, AdminUser } from '../../../core/services/super-admin.service';
import { SnackService } from '../../../core/services/snack.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { AdminUserDialogComponent } from '../admin-user-dialog/admin-user-dialog.component';


@Component({
  selector: 'app-super-admin-users',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, FormsModule, TranslateModule, MatButtonModule, MatIconModule, PageHeaderComponent, EmptyStateComponent, TablePagerComponent, TableExportToolbarComponent, MatProgressSpinnerModule, MatTooltipModule],
  templateUrl: './super-admin-users.component.html'
})
export class SuperAdminUsersComponent implements OnInit {
  listLoad = new ListLoadController();
  rows: AdminUser[] = [];
  pageIndex = 0;
  pageSize = DEFAULT_TABLE_PAGE_SIZE;
  totalElements = 0;
  searchTerm = '';
  private searchTimer?: ReturnType<typeof setTimeout>;
  private readonly dialogConfig = {
    width: '520px',
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

  readonly exportColumns: ExportColumn<AdminUser>[] = [
    { header: 'Name (AR)', value: 'fullNameAr' },
    { header: 'Name (EN)', value: (row) => row.fullNameEn ?? '-' },
    { header: 'Email', value: 'email' },
    { header: 'Phone', value: (row) => row.phone ?? '-' },
    { header: 'Role', value: 'role' },
    { header: 'Active', value: (row) => row.active ? 'Yes' : 'No' }
  ];

  loadExportRows = (): Promise<AdminUser[]> =>
    firstValueFrom(
      this.admin.getUsers(withPageParams(0, Math.max(this.totalElements, 1), { q: this.searchTerm }))
    ).then((res) => res.content);
  ngOnInit(): void { this.load(); }
  load(): void {
    this.listLoad.begin();
    this.admin.getUsers(withPageParams(this.pageIndex, this.pageSize, { q: this.searchTerm })).subscribe({
      next: (res) => { this.rows = res.content; this.totalElements = res.totalElements; this.listLoad.end(); },
      error: () => { this.rows = []; this.totalElements = 0; this.listLoad.end(); }
    });
  }
  confirmDeactivate(u: AdminUser): void {
    if (!u.active) {
      this.snack.error(this.i18n.instant('ADMIN.USER_ALREADY_INACTIVE'));
      return;
    }
    this.dialog.open(ConfirmDialogComponent, {
      width: '440px',
      panelClass: 'app-dialog-panel',
      data: {
        title: 'ACTIONS.DELETE',
        message: 'ADMIN.DEACTIVATE_USER_CONFIRM',
        danger: true,
        confirmLabel: 'ACTIONS.DELETE'
      }
    }).afterClosed().subscribe((ok) => {
      if (!ok) return;
      this.toggleActive(u);
    });
  }
  toggleActive(u: AdminUser): void {
    this.admin.toggleUserActive(u.id).subscribe({
      next: () => { this.snack.success(this.i18n.instant('ADMIN.USER_UPDATED')); this.load(); }
    });
  }
  openEdit(u: AdminUser): void {
    this.dialog.open(AdminUserDialogComponent, {
      ...this.dialogConfig,
      data: { user: u }
    }).afterClosed().subscribe((ok) => { if (ok) this.load(); });
  }
  onPageChange(i: number): void { this.pageIndex = i; this.load(); }
  onSearch(): void { clearTimeout(this.searchTimer); this.searchTimer = setTimeout(() => { this.pageIndex = 0; this.load(); }, 300); }
  hasActiveFilters(): boolean { return !!this.searchTerm?.trim(); }
}
