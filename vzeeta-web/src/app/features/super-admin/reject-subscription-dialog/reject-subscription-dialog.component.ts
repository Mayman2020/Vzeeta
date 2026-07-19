import { NgIf } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { DialogTitleCloseDirective } from '../../../shared/directives/dialog-title-close.directive';

@Component({
  selector: 'app-reject-subscription-dialog',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule, TranslateModule, DialogTitleCloseDirective],
  template: `
    <h2 mat-dialog-title>
      <mat-icon class="dialog-title-icon">block</mat-icon>
      {{ 'SUBSCRIPTION.REJECT_PAYMENT' | translate }}
    </h2>
    <mat-dialog-content class="dialog-body">
      <form [formGroup]="form" class="rms-dialog-form">
        <mat-form-field appearance="outline" class="full-col">
          <mat-label>{{ 'SUBSCRIPTION.REJECTION_REASON' | translate }}</mat-label>
          <textarea matInput rows="3" formControlName="reason"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="dialog-actions">
      <button mat-stroked-button type="button" (click)="ref.close(null)">{{ 'COMMON.CANCEL' | translate }}</button>
      <button mat-flat-button color="warn" type="button" (click)="ref.close(form.value.reason)" [disabled]="form.invalid">
        {{ 'SUBSCRIPTION.REJECT' | translate }}
      </button>
    </mat-dialog-actions>
  `
})
export class RejectSubscriptionDialogComponent {
  readonly form: FormGroup;

  constructor(
    readonly ref: MatDialogRef<RejectSubscriptionDialogComponent, string | null>,
    @Inject(MAT_DIALOG_DATA) readonly data: unknown,
    private readonly fb: FormBuilder
  ) {
    this.form = this.fb.group({ reason: ['', Validators.required] });
  }
}
