import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { TablePagerComponent } from '../../../shared/components/table-pager/table-pager.component';
import { SearchableSelectComponent } from '../../../shared/components/searchable-select/searchable-select.component';
import { ListLoadController } from '../../../shared/utils/list-load.util';
import { DEFAULT_TABLE_PAGE_SIZE, withPageParams } from '../../../core/utils/pagination.util';
import { RmsDatePipe } from '../../../shared/pipes/rms-date.pipe';
import { ClinicAdminService } from '../../../core/services/clinic-admin.service';
import { Appointment } from '../../../core/models/appointment.model';
import { I18nService } from '../../../core/i18n/i18n.service';

const ESTATE_DIALOG_OPTS = {
  width: '560px',
  maxWidth: '95vw',
  panelClass: 'app-dialog-panel',
  disableClose: true
} as const;


@Component({
  selector: 'app-clinic-appointments',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, TranslateModule, RmsDatePipe, PageHeaderComponent, EmptyStateComponent, TablePagerComponent, SearchableSelectComponent, MatProgressSpinnerModule],
  templateUrl: './clinic-appointments.component.html',
  styleUrls: ['./clinic-appointments.component.scss']
})
export class ClinicAppointmentsComponent implements OnInit {
  listLoad = new ListLoadController();
  rows: Appointment[] = [];
  pageIndex = 0;
  pageSize = DEFAULT_TABLE_PAGE_SIZE;
  totalElements = 0;
  searchTerm = '';
  statusFilter = '__ALL__';
  readonly appointmentStatuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'REJECTED', 'RESCHEDULED'] as const;
  statusFilterOptions: { code: string; labelKey: string; nameAr: string; nameEn: string }[] = [];
  private searchTimer?: ReturnType<typeof setTimeout>;
  constructor(
    private readonly clinicAdmin: ClinicAdminService,
    private readonly i18n: I18nService
  ) {}
  ngOnInit(): void {
    this.statusFilterOptions = [
      { code: '__ALL__', labelKey: 'COMMON.ALL', nameAr: this.i18n.instant('COMMON.ALL'), nameEn: this.i18n.instant('COMMON.ALL') },
      ...this.appointmentStatuses.map((s) => ({
        code: s,
        labelKey: `STATUS.${s}`,
        nameAr: this.i18n.instant(`STATUS.${s}`),
        nameEn: this.i18n.instant(`STATUS.${s}`)
      }))
    ];
    this.load();
  }
  load(): void {
    this.listLoad.begin();
    const params = withPageParams(this.pageIndex, this.pageSize, { q: this.searchTerm });
    if (this.statusFilter && this.statusFilter !== '__ALL__') params['status'] = this.statusFilter;
    this.clinicAdmin.getAppointments(params).subscribe({
      next: (res) => { this.rows = res.content; this.totalElements = res.totalElements; this.listLoad.end(); },
      error: () => { this.rows = []; this.totalElements = 0; this.listLoad.end(); }
    });
  }
  onPageChange(i: number): void { this.pageIndex = i; this.load(); }
  onSearch(): void { clearTimeout(this.searchTimer); this.searchTimer = setTimeout(() => { this.pageIndex = 0; this.load(); }, 300); }
  onStatusChange(): void {
    this.statusFilter = this.statusFilter ?? '__ALL__';
    this.pageIndex = 0;
    this.load();
  }
  hasActiveFilters(): boolean { return !!this.searchTerm?.trim() || (this.statusFilter !== '__ALL__'); }
}
