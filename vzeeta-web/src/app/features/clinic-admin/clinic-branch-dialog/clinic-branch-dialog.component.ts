import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { DialogTitleCloseDirective } from '../../../shared/directives/dialog-title-close.directive';
import { ClinicAdminService } from '../../../core/services/clinic-admin.service';
import { SnackService } from '../../../core/services/snack.service';
import { I18nService } from '../../../core/i18n/i18n.service';

@Component({
  selector: 'app-clinic-branch-dialog',
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
    DialogTitleCloseDirective
  ],
  templateUrl: './clinic-branch-dialog.component.html',
  styleUrls: ['./clinic-branch-dialog.component.scss']
})
export class ClinicBranchDialogComponent {
  saving = false;
  readonly form: FormGroup;

  constructor(
    readonly ref: MatDialogRef<ClinicBranchDialogComponent, boolean>,
    private readonly fb: FormBuilder,
    private readonly clinicAdmin: ClinicAdminService,
    private readonly snack: SnackService,
    private readonly i18n: I18nService
  ) {
    this.form = this.fb.group({
      nameAr: ['', Validators.required],
      nameEn: [''],
      phone: [''],
      active: [true]
    });
  }

  save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.saving) return;
    this.saving = true;
    this.clinicAdmin.saveBranch(this.form.getRawValue()).subscribe({
      next: () => {
        this.saving = false;
        this.snack.success(this.i18n.instant('COMMON.SAVE'));
        this.ref.close(true);
      },
      error: () => { this.saving = false; }
    });
  }
}
