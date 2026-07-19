import { Component, Inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { DialogTitleCloseDirective } from '../../../shared/directives/dialog-title-close.directive';
import { AdminCity, SuperAdminService } from '../../../core/services/super-admin.service';
import { SnackService } from '../../../core/services/snack.service';
import { I18nService } from '../../../core/i18n/i18n.service';

export type GeoDialogMode = 'city' | 'area';

export interface GeoItemDialogData {
  mode: GeoDialogMode;
  cities: AdminCity[];
  defaultCityId?: number | null;
}

@Component({
  selector: 'app-geo-item-dialog',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    TranslateModule,
    DialogTitleCloseDirective
  ],
  templateUrl: './geo-item-dialog.component.html',
  styleUrls: ['./geo-item-dialog.component.scss']
})
export class GeoItemDialogComponent {
  saving = false;
  readonly form: FormGroup;

  constructor(
    readonly ref: MatDialogRef<GeoItemDialogComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) readonly data: GeoItemDialogData,
    private readonly fb: FormBuilder,
    private readonly admin: SuperAdminService,
    private readonly snack: SnackService,
    private readonly i18n: I18nService
  ) {
    this.form = this.fb.group({
      cityId: [data.defaultCityId ?? data.cities[0]?.id ?? null, data.mode === 'area' ? Validators.required : []],
      nameAr: ['', Validators.required],
      nameEn: ['']
    });
  }

  nameOf(item: { nameAr: string; nameEn?: string }): string {
    return this.i18n.currentLang === 'ar' ? item.nameAr : (item.nameEn || item.nameAr);
  }

  save(): void {
    if (this.form.invalid || this.saving) return;
    this.saving = true;
    const { nameAr, nameEn, cityId } = this.form.value;
    const req$ = this.data.mode === 'city'
      ? this.admin.saveCity({ nameAr, nameEn: nameEn || undefined })
      : this.admin.saveArea({ cityId, nameAr, nameEn: nameEn || undefined });

    req$.subscribe({
      next: () => {
        this.saving = false;
        this.snack.success(this.i18n.instant(
          this.data.mode === 'city' ? 'ADMIN.CITY_SAVED' : 'ADMIN.AREA_SAVED'
        ));
        this.ref.close(true);
      },
      error: (err: Error) => {
        this.saving = false;
        this.snack.error(err.message);
      }
    });
  }
}
