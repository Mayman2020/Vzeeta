import { Component, OnInit } from '@angular/core';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FeatureShellComponent } from '../../../shared/components/feature-shell/feature-shell.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { TablePagerComponent } from '../../../shared/components/table-pager/table-pager.component';
import { ListLoadController } from '../../../shared/utils/list-load.util';
import { DEFAULT_TABLE_PAGE_SIZE, withPageParams } from '../../../core/utils/pagination.util';
import { SuperAdminService, AdminClinic, AdminDoctor, AdminPayment, AdminUser, SystemSetting } from '../../../core/services/super-admin.service';
import { SnackService } from '../../../core/services/snack.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { RolePermissionDto, RolePermissionService } from '../../../core/services/role-permission.service';
import { AuthService } from '../../../core/services/auth.service';
import { PermissionAction, PermissionMap, USER_ROLE_VALUES, UserRole } from '../../../core/models/user.model';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ClinicDialogComponent } from '../clinic-dialog/clinic-dialog.component';
import { AdminUserDialogComponent } from '../admin-user-dialog/admin-user-dialog.component';
import { RmsDatePipe } from '../../../shared/pipes/rms-date.pipe';


@Component({
  selector: 'app-super-admin-settings',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, TranslateModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatTooltipModule, PageHeaderComponent, EmptyStateComponent, TablePagerComponent, MatProgressSpinnerModule],
  templateUrl: './super-admin-settings.component.html',
  styleUrls: ['./super-admin-settings.component.scss']
})
export class SuperAdminSettingsComponent implements OnInit {
  listLoad = new ListLoadController();
  rows: SystemSetting[] = [];
  pageIndex = 0;
  pageSize = DEFAULT_TABLE_PAGE_SIZE;
  totalElements = 0;
  searchTerm = '';
  editKey = '';
  editValue = '';
  private searchTimer?: ReturnType<typeof setTimeout>;
  constructor(
    private readonly admin: SuperAdminService,
    private readonly snack: SnackService,
    private readonly i18n: I18nService
  ) {}
  ngOnInit(): void { this.load(); }
  load(): void {
    this.listLoad.begin();
    this.admin.getSettings(withPageParams(this.pageIndex, this.pageSize, { q: this.searchTerm })).subscribe({
      next: (res) => { this.rows = res.content; this.totalElements = res.totalElements; this.listLoad.end(); },
      error: () => { this.rows = []; this.totalElements = 0; this.listLoad.end(); }
    });
  }
  onPageChange(i: number): void { this.pageIndex = i; this.load(); }
  onSearch(): void { clearTimeout(this.searchTimer); this.searchTimer = setTimeout(() => { this.pageIndex = 0; this.load(); }, 300); }
  hasActiveFilters(): boolean { return !!this.searchTerm?.trim(); }
  startEdit(s: SystemSetting): void { this.editKey = s.settingKey; this.editValue = s.settingValue; }
  cancelEdit(): void { this.editKey = ''; this.editValue = ''; }
  saveEdit(s: SystemSetting): void {
    this.admin.updateSetting(s.settingKey, this.editValue).subscribe({
      next: () => {
        this.snack.success(this.i18n.instant('COMMON.SAVE'));
        this.cancelEdit();
        this.load();
      }
    });
  }
}

const PERMISSION_ACTIONS: PermissionAction[] = ['enabled', 'menu', 'view', 'create', 'edit', 'delete', 'export', 'approve'];
