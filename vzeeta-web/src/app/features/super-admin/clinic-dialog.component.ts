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
import { DialogTitleCloseDirective } from '../../shared/directives/dialog-title-close.directive';
import { AdminClinic, SuperAdminService } from '../../core/services/super-admin.service';
import { SnackService } from '../../core/services/snack.service';
import { I18nService } from '../../core/i18n/i18n.service';

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
    DialogTitleCloseDirective
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon class="dialog-title-icon">{{ data.clinic ? 'edit' : 'add_business' }}</mat-icon>
      {{ (data.clinic ? 'ADMIN.EDIT_CLINIC' : 'ADMIN.ADD_CLINIC') | translate }}
    </h2>
    <mat-dialog-content class="dialog-body">
      <form [formGroup]="form" class="rms-dialog-form">
        <mat-form-field appearance="outline">
          <mat-label>{{ 'LOOKUPS.NAME_AR' | translate }}</mat-label>
          <input matInput formControlName="nameAr" dir="rtl">
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>{{ 'LOOKUPS.NAME_EN' | translate }}</mat-label>
          <input matInput formControlName="nameEn" dir="ltr">
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>{{ 'AUTH.EMAIL' | translate }}</mat-label>
          <input matInput formControlName="email" type="email" dir="ltr">
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>{{ 'AUTH.PHONE' | translate }}</mat-label>
          <input matInput formControlName="phone" dir="ltr">
        </mat-form-field>
        <div class="full-col dialog-checks">
          <mat-checkbox formControlName="active">{{ 'ADMIN.ACTIVE' | translate }}</mat-checkbox>
          <mat-checkbox formControlName="verified">{{ 'ADMIN.VERIFIED' | translate }}</mat-checkbox>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="dialog-actions">
      <button mat-stroked-button type="button" (click)="ref.close(false)">{{ 'COMMON.CANCEL' | translate }}</button>
      <button mat-flat-button color="primary" type="button" (click)="save()" [disabled]="saving || form.invalid">
        <mat-spinner *ngIf="saving" diameter="18"></mat-spinner>
        <span *ngIf="!saving">{{ 'COMMON.SAVE' | translate }}</span>
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-checks {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      padding-top: 4px;
    }
    .dialog-actions {
      gap: 10px;
      padding: 8px 16px 16px;
    }
  `]
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
