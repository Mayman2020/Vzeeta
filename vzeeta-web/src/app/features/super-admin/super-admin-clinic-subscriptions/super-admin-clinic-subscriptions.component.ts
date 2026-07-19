import { Component, OnInit } from '@angular/core';
import { DecimalPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { TablePagerComponent } from '../../../shared/components/table-pager/table-pager.component';
import { ListLoadController } from '../../../shared/utils/list-load.util';
import { DEFAULT_TABLE_PAGE_SIZE, withPageParams } from '../../../core/utils/pagination.util';
import { RmsDatePipe } from '../../../shared/pipes/rms-date.pipe';
import { ClinicSubscription, ClinicSubscriptionStatus, SubscriptionService } from '../../../core/services/subscription.service';
import { AdminClinic, SuperAdminService } from '../../../core/services/super-admin.service';
import { SnackService } from '../../../core/services/snack.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { RejectSubscriptionDialogComponent } from '../reject-subscription-dialog/reject-subscription-dialog.component';
import { GrantTrialDialogComponent } from '../grant-trial-dialog/grant-trial-dialog.component';

@Component({
  selector: 'app-super-admin-clinic-subscriptions',
  standalone: true,
  imports: [
    NgFor, NgIf, NgClass, DecimalPipe, FormsModule, RmsDatePipe, TranslateModule,
    MatButtonModule, MatIconModule, MatTooltipModule, MatProgressSpinnerModule, MatSelectModule, MatFormFieldModule,
    PageHeaderComponent, EmptyStateComponent, TablePagerComponent
  ],
  templateUrl: './super-admin-clinic-subscriptions.component.html'
})
export class SuperAdminClinicSubscriptionsComponent implements OnInit {
  listLoad = new ListLoadController();
  rows: ClinicSubscription[] = [];
  pageIndex = 0;
  pageSize = DEFAULT_TABLE_PAGE_SIZE;
  totalElements = 0;
  statusFilter: ClinicSubscriptionStatus | '' = 'PENDING_APPROVAL';
  clinicNames: Record<number, string> = {};
  busy: Record<number, boolean> = {};

  readonly statuses: ClinicSubscriptionStatus[] = ['PENDING_APPROVAL', 'ACTIVE', 'REJECTED', 'EXPIRED', 'CANCELLED'];

  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly adminService: SuperAdminService,
    private readonly snack: SnackService,
    private readonly i18n: I18nService,
    private readonly dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadClinicNames();
    this.load();
  }

  private loadClinicNames(): void {
    this.adminService.getClinics({ size: 500 }).subscribe({
      next: (res) => {
        const map: Record<number, string> = {};
        res.content.forEach((c: AdminClinic) => { map[c.id] = c.nameAr || c.nameEn || `#${c.id}`; });
        this.clinicNames = map;
      }
    });
  }

  load(): void {
    this.listLoad.begin();
    this.subscriptionService.getClinicSubscriptions(this.statusFilter, withPageParams(this.pageIndex, this.pageSize)).subscribe({
      next: (res) => { this.rows = res.content; this.totalElements = res.totalElements; this.listLoad.end(); },
      error: () => { this.rows = []; this.totalElements = 0; this.listLoad.end(); }
    });
  }

  clinicName(row: ClinicSubscription): string {
    return this.clinicNames[row.clinicId] || `#${row.clinicId}`;
  }

  onPageChange(i: number): void { this.pageIndex = i; this.load(); }
  onStatusChange(): void { this.pageIndex = 0; this.load(); }
  hasActiveFilters(): boolean { return !!this.statusFilter; }

  approve(row: ClinicSubscription): void {
    this.busy[row.id] = true;
    this.subscriptionService.approve(row.id).subscribe({
      next: () => {
        this.busy[row.id] = false;
        this.snack.success(this.i18n.instant('SUBSCRIPTION.APPROVED_OK'));
        this.load();
      },
      error: () => { this.busy[row.id] = false; }
    });
  }

  reject(row: ClinicSubscription): void {
    this.dialog.open(RejectSubscriptionDialogComponent, { width: '460px', maxWidth: '95vw', panelClass: 'app-dialog-panel' })
      .afterClosed().subscribe((reason: string | null) => {
        if (!reason) return;
        this.busy[row.id] = true;
        this.subscriptionService.reject(row.id, reason).subscribe({
          next: () => {
            this.busy[row.id] = false;
            this.snack.success(this.i18n.instant('SUBSCRIPTION.REJECTED_OK'));
            this.load();
          },
          error: () => { this.busy[row.id] = false; }
        });
      });
  }

  grantTrial(row: ClinicSubscription): void {
    this.dialog.open(GrantTrialDialogComponent, {
      width: '440px',
      maxWidth: '95vw',
      panelClass: 'app-dialog-panel',
      data: { clinicId: row.clinicId, clinicName: this.clinicName(row) }
    }).afterClosed().subscribe((ok) => { if (ok) this.load(); });
  }
}
