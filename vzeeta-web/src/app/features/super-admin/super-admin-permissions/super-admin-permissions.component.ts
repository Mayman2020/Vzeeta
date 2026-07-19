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

const PERMISSION_ACTIONS: PermissionAction[] = ['enabled', 'menu', 'view', 'create', 'edit', 'delete', 'export', 'approve'];

@Component({
  selector: 'app-super-admin-permissions',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    FormsModule,
    TranslateModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    PageHeaderComponent,
    TablePagerComponent
  ],
  templateUrl: './super-admin-permissions.component.html',
  styleUrls: ['./super-admin-permissions.component.scss']
})
export class SuperAdminPermissionsComponent implements OnInit {
  loading = true;
  saving = false;
  roles = USER_ROLE_VALUES;
  selectedRole: UserRole = 'CLINIC_ADMIN';
  allRoles: RolePermissionDto[] = [];
  permissions: PermissionMap = {};
  modules: string[] = [];
  pageIndex = 0;
  readonly pageSize = DEFAULT_TABLE_PAGE_SIZE;
  readonly actions = PERMISSION_ACTIONS;

  get displayedModules(): string[] {
    const start = this.pageIndex * this.pageSize;
    return this.modules.slice(start, start + this.pageSize);
  }

  constructor(
    private readonly rolePermissionService: RolePermissionService,
    private readonly snack: SnackService,
    private readonly i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.rolePermissionService.getAll().subscribe({
      next: (res) => {
        this.allRoles = res.data ?? [];
        if (!this.roles.includes(this.selectedRole)) {
          this.selectedRole = this.roles[0] ?? 'SUPER_ADMIN';
        }
        this.applyRole(this.selectedRole);
        this.loading = false;
      },
      error: (err: Error) => {
        this.snack.error(err.message);
        this.loading = false;
      }
    });
  }

  onRoleChange(): void {
    this.applyRole(this.selectedRole);
  }

  onPageChange(index: number): void {
    this.pageIndex = index;
  }

  moduleLabelKey(module: string): string {
    return `PERMISSIONS.MODULES.${module.toUpperCase()}`;
  }

  isChecked(module: string, action: PermissionAction): boolean {
    return this.permissions[module]?.[action] === true;
  }

  toggle(module: string, action: PermissionAction, checked: boolean): void {
    if (!this.permissions[module]) {
      this.permissions[module] = {
        enabled: false,
        menu: false,
        view: false,
        create: false,
        edit: false,
        delete: false,
        export: false,
        approve: false
      };
    }
    this.permissions[module][action] = checked;
  }

  save(): void {
    this.saving = true;
    this.rolePermissionService.update(this.selectedRole, this.permissions).subscribe({
      next: (res) => {
        const idx = this.allRoles.findIndex((x) => x.role === this.selectedRole);
        if (idx >= 0 && res.data) this.allRoles[idx] = res.data;
        this.snack.success(this.i18n.instant('COMMON.SAVED'));
        this.saving = false;
      },
      error: (err: Error) => {
        this.snack.error(err.message);
        this.saving = false;
      }
    });
  }

  private applyRole(role: UserRole): void {
    const found = this.allRoles.find((item) => item.role === role);
    this.permissions = { ...(found?.permissions ?? {}) };
    this.modules = Object.keys(this.permissions);
    this.pageIndex = 0;
  }
}
