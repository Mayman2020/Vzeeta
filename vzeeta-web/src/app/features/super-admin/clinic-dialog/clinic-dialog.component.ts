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
import { AdminClinic, SuperAdminService } from '../../../core/services/super-admin.service';
import { SnackService } from '../../../core/services/snack.service';
import { I18nService } from '../../../core/i18n/i18n.service';

export interface ClinicDialogData {
  clinic: AdminClinic | null;
}

@Component({
  selector: 'app-clinic-dialog',
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
  templateUrl: './clinic-dialog.component.html',
  styleUrls: ['./clinic-dialog.component.scss']
})
export class ClinicDialogComponent {
  saving = false;
  readonly form: FormGroup;

  constructor(
    readonly ref: MatDialogRef<ClinicDialogComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) readonly data: ClinicDialogData,
    private readonly fb: FormBuilder,
    private readonly admin: SuperAdminService,
    private readonly snack: SnackService,
    private readonly i18n: I18nService
  ) {
    const clinic = data.clinic;
    this.form = this.fb.group({
      nameAr: [clinic?.nameAr ?? '', Validators.required],
      nameEn: [clinic?.nameEn ?? ''],
      email: [clinic?.email ?? ''],
      phone: [clinic?.phone ?? ''],
      active: [clinic?.active ?? true],
      verified: [clinic?.verified ?? false]
    });
  }

  save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.saving) return;
    this.saving = true;
    const payload = {
      ...this.form.getRawValue(),
      ...(this.data.clinic ? { id: this.data.clinic.id } : {})
    };
    this.admin.saveClinic(payload).subscribe({
      next: () => {
        this.saving = false;
        this.snack.success(this.i18n.instant('ADMIN.CLINIC_SAVED'));
        this.ref.close(true);
      },
      error: () => {
        this.saving = false;
      }
    });
  }
}
