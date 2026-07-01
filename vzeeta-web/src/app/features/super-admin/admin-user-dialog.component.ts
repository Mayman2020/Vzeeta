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
import { AdminUser, SuperAdminService } from '../../core/services/super-admin.service';
import { SnackService } from '../../core/services/snack.service';
import { I18nService } from '../../core/i18n/i18n.service';

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
    DialogTitleCloseDirective
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon class="dialog-title-icon">person</mat-icon>
      {{ 'ADMIN.EDIT_USER' | translate }}
    </h2>
    <mat-dialog-content class="dialog-body">
      <form [formGroup]="form" class="rms-dialog-form">
        <mat-form-field appearance="outline">
          <mat-label>{{ 'LOOKUPS.NAME_AR' | translate }}</mat-label>
          <input matInput formControlName="fullNameAr" dir="rtl">
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>{{ 'LOOKUPS.NAME_EN' | translate }}</mat-label>
          <input matInput formControlName="fullNameEn" dir="ltr">
        </mat-form-field>
        <div class="full-col dialog-checks">
          <mat-checkbox formControlName="active">{{ 'ADMIN.ACTIVE' | translate }}</mat-checkbox>
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
