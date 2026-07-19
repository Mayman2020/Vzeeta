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
import { ClinicAdminService, ClinicDoctor, CreateDoctorRequest } from '../../../core/services/clinic-admin.service';
import { SnackService } from '../../../core/services/snack.service';
import { I18nService } from '../../../core/i18n/i18n.service';

export type ClinicDoctorDialogMode = 'create' | 'edit';

export interface ClinicDoctorDialogData {
  mode: ClinicDoctorDialogMode;
  doctor?: ClinicDoctor;
}

@Component({
  selector: 'app-clinic-doctor-dialog',
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
  templateUrl: './clinic-doctor-dialog.component.html',
  styleUrls: ['./clinic-doctor-dialog.component.scss']
})
export class ClinicDoctorDialogComponent {
  saving = false;
  readonly form: FormGroup;

  constructor(
    readonly ref: MatDialogRef<ClinicDoctorDialogComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) readonly data: ClinicDoctorDialogData,
    private readonly fb: FormBuilder,
    private readonly clinicAdmin: ClinicAdminService,
    private readonly snack: SnackService,
    private readonly i18n: I18nService
  ) {
    const doctor = data.doctor;
    if (data.mode === 'create') {
      this.form = this.fb.group({
        fullNameAr: ['', Validators.required],
        fullNameEn: [''],
        email: ['', [Validators.required, Validators.email]],
        phone: [''],
        titleAr: [''],
        consultationFee: [0, Validators.required],
        acceptsOnline: [true],
        acceptsInClinic: [true]
      });
    } else {
      this.form = this.fb.group({
        titleAr: [doctor?.titleAr ?? '', Validators.required],
        consultationFee: [doctor?.consultationFee ?? 0, Validators.required]
      });
    }
  }

  save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.saving) return;
    this.saving = true;
    if (this.data.mode === 'create') {
      const req: CreateDoctorRequest = this.form.getRawValue();
      this.clinicAdmin.createDoctor(req).subscribe({
        next: () => this.finish(true),
        error: () => { this.saving = false; }
      });
      return;
    }
    const doctor = this.data.doctor;
    if (!doctor) {
      this.saving = false;
      return;
    }
    this.clinicAdmin.updateDoctor(doctor.id, this.form.getRawValue()).subscribe({
      next: () => this.finish(true),
      error: () => { this.saving = false; }
    });
  }

  private finish(ok: boolean): void {
    this.saving = false;
    if (ok) this.snack.success(this.i18n.instant('COMMON.SAVE'));
    this.ref.close(ok);
  }
}
