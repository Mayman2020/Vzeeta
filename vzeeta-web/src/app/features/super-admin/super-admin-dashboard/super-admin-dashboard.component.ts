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
  selector: 'app-super-admin-dashboard',
  standalone: true,
  imports: [NgFor, NgIf, TranslateModule, LoadingSpinnerComponent, MatIconModule, MatButtonModule, RouterLink],
  templateUrl: './super-admin-dashboard.component.html',
  styleUrls: ['./super-admin-dashboard.component.scss']
})
export class SuperAdminDashboardComponent implements OnInit {
  loading = true;
  clinicCount = 0;
  userCount = 0;
  pendingCount = 0;
  paymentCount = 0;

  readonly quickNav = [
    { route: '/super-admin/clinics', icon: 'local_hospital', labelKey: 'NAV.CLINICS', tone: 'indigo' },
    { route: '/super-admin/users', icon: 'people', labelKey: 'NAV.USERS', tone: 'blue' },
    { route: '/super-admin/verification', icon: 'verified', labelKey: 'NAV.VERIFICATION', tone: 'orange' },
    { route: '/super-admin/payments', icon: 'payments', labelKey: 'NAV.PAYMENTS', tone: 'teal' },
    { route: '/super-admin/lookups', icon: 'list_alt', labelKey: 'NAV.LOOKUPS', tone: 'green' },
    { route: '/super-admin/permissions', icon: 'security', labelKey: 'NAV.PERMISSIONS', tone: 'purple' },
    { route: '/super-admin/settings', icon: 'settings', labelKey: 'NAV.SETTINGS', tone: 'slate' },
  ];

  constructor(private readonly admin: SuperAdminService) {}

  ngOnInit(): void {
    this.admin.getDashboard().subscribe({
      next: (d) => {
        this.clinicCount = d.clinicCount;
        this.userCount = d.userCount;
        this.pendingCount = d.unverifiedDoctorCount;
        this.paymentCount = d.paymentCount;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }
}
