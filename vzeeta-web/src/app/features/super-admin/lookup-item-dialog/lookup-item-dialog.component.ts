import { Component, Inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TranslateModule } from '@ngx-translate/core';
import { DialogTitleCloseDirective } from '../../../shared/directives/dialog-title-close.directive';
import { LookupItem, LookupService, LookupType } from '../../../core/services/lookup.service';
import { SnackService } from '../../../core/services/snack.service';
import { I18nService } from '../../../core/i18n/i18n.service';

export interface LookupItemDialogData {
  type: LookupType;
  item: LookupItem | null;
}

@Component({
  selector: 'app-lookup-item-dialog',
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    TranslateModule,
    DialogTitleCloseDirective
  ],
  templateUrl: './lookup-item-dialog.component.html',
  styleUrls: ['./lookup-item-dialog.component.scss']
})
export class LookupItemDialogComponent {
  saving = false;
  readonly form: FormGroup;

  constructor(
    readonly ref: MatDialogRef<LookupItemDialogComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) readonly data: LookupItemDialogData,
    private readonly fb: FormBuilder,
    private readonly lookupService: LookupService,
    private readonly snack: SnackService,
    private readonly i18n: I18nService
  ) {
    const item = data.item;
    this.form = this.fb.group({
      nameAr: [item?.nameAr ?? '', [Validators.required, Validators.maxLength(150)]],
      nameEn: [item?.nameEn ?? '', [Validators.required, Validators.maxLength(150)]],
      code: [item?.code ?? '', [Validators.maxLength(50)]],
      sortOrder: [item?.sortOrder ?? 0],
      active: [item?.active ?? true]
    });
  }

  save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    if (this.saving) return;
    this.saving = true;
    const { nameAr, nameEn, code, sortOrder, active } = this.form.value;
    const item = this.data.item;
    const req$ = item
      ? this.lookupService.update(item.id, {
          code: code || item.code,
          nameAr,
          nameEn,
          sortOrder: Number(sortOrder ?? 0),
          active: !!active
        })
      : this.lookupService.create({
          type: this.data.type,
          nameAr,
          nameEn,
          sortOrder: Number(sortOrder ?? 0),
          code: code?.trim() || undefined
        });

    req$.subscribe({
      next: () => {
        this.saving = false;
        this.snack.success(this.i18n.instant('COMMON.SAVED'));
        this.ref.close(true);
      },
      error: (err: Error) => {
        this.saving = false;
        this.snack.error(err.message);
      }
    });
  }
}
