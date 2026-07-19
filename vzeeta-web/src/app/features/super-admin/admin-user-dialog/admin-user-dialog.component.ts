import { NgIf } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { DialogTitleCloseDirective } from '../../../shared/directives/dialog-title-close.directive';
import { AuditTrailComponent } from '../../../shared/components/audit-trail/audit-trail.component';
import { AdminUser, SuperAdminService } from '../../../core/services/super-admin.service';
import { SnackService } from '../../../core/services/snack.service';
import { I18nService } from '../../../core/i18n/i18n.service';

export interface AdminUserDialogData {
  user: AdminUser;
}

@Component({
  selector: 'app-admin-user-dialog',
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslateModule,
    DialogTitleCloseDirective,
    AuditTrailComponent
  ],
  templateUrl: './admin-user-dialog.component.html',
  styleUrls: ['./admin-user-dialog.component.scss']
})
export class AdminUserDialogComponent {
  saving = false;
  readonly form: FormGroup;

  constructor(
    readonly ref: MatDialogRef<AdminUserDialogComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) readonly data: AdminUserDialogData,
    private readonly fb: FormBuilder,
    private readonly admin: SuperAdminService,
    private readonly snack: SnackService,
    private readonly i18n: I18nService
  ) {
    const user = data.user;
    this.form = this.fb.group({
      fullNameAr: [user.fullNameAr ?? '', Validators.required],
      fullNameEn: [user.fullNameEn ?? ''],
      active: [user.active]
    });
  }

  save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.saving) return;
    this.saving = true;
    this.admin.updateUser(this.data.user.id, this.form.getRawValue()).subscribe({
      next: () => {
        this.saving = false;
        this.snack.success(this.i18n.instant('ADMIN.USER_UPDATED'));
        this.ref.close(true);
      },
      error: () => {
        this.saving = false;
      }
    });
  }
}
