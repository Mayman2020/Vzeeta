import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { TablePagerComponent } from '../../../shared/components/table-pager/table-pager.component';
import { TableRowIndexPipe } from '../../../shared/pipes/table-row-index.pipe';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { LookupItem, LookupService, LookupType } from '../../../core/services/lookup.service';
import { AdminArea, AdminCity, SuperAdminService } from '../../../core/services/super-admin.service';
import { SnackService } from '../../../core/services/snack.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { LookupItemDialogComponent } from '../lookup-item-dialog/lookup-item-dialog.component';
import { GeoItemDialogComponent } from '../geo-item-dialog/geo-item-dialog.component';

const LOOKUP_PAGE_SIZE = 5;

interface LookupListDef {
  type: LookupType;
  labelKey: string;
  icon: string;
}

@Component({
  selector: 'app-super-admin-lookups',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    TranslateModule,
    MatTabsModule,
    MatExpansionModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    PageHeaderComponent,
    TablePagerComponent,
    TableRowIndexPipe
  ],
  templateUrl: './super-admin-lookups.component.html'
})
export class SuperAdminLookupsComponent implements OnInit {
  readonly pageSize = LOOKUP_PAGE_SIZE;
  readonly lists: LookupListDef[] = [
    { type: 'CLINIC_TYPE', labelKey: 'LOOKUPS.TAB_CLINIC_TYPE', icon: 'local_hospital' },
    { type: 'PAYMENT_METHOD', labelKey: 'LOOKUPS.TAB_PAYMENT_METHOD', icon: 'payments' },
    { type: 'APPOINTMENT_STATUS', labelKey: 'LOOKUPS.TAB_APPOINTMENT_STATUS', icon: 'event' }
  ];
  readonly items: Record<LookupType, LookupItem[]> = {
    CLINIC_TYPE: [],
    PAYMENT_METHOD: [],
    APPOINTMENT_STATUS: []
  };
  readonly loading: Record<LookupType, boolean> = {
    CLINIC_TYPE: false,
    PAYMENT_METHOD: false,
    APPOINTMENT_STATUS: false
  };
  readonly pageIndex: Record<LookupType, number> = {
    CLINIC_TYPE: 0,
    PAYMENT_METHOD: 0,
    APPOINTMENT_STATUS: 0
  };
  deletingId: number | null = null;

  cities: AdminCity[] = [];
  areas: AdminArea[] = [];
  selectedCityId: number | null = null;
  citiesLoading = true;
  areasLoading = false;
  citiesPageIndex = 0;
  areasPageIndex = 0;

  constructor(
    private readonly lookupService: LookupService,
    private readonly admin: SuperAdminService,
    private readonly snack: SnackService,
    private readonly i18n: I18nService,
    private readonly dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.lists.forEach((list) => this.loadType(list.type));
    this.loadCities();
  }

  get filteredAreas(): AdminArea[] {
    if (this.selectedCityId == null) return this.areas;
    return this.areas.filter((a) => a.cityId === this.selectedCityId);
  }

  get pagedCities(): AdminCity[] {
    const start = this.citiesPageIndex * this.pageSize;
    return this.cities.slice(start, start + this.pageSize);
  }

  get pagedAreas(): AdminArea[] {
    const start = this.areasPageIndex * this.pageSize;
    return this.filteredAreas.slice(start, start + this.pageSize);
  }

  nameOf(item: { nameAr: string; nameEn?: string }): string {
    return this.i18n.currentLang === 'ar' ? item.nameAr : (item.nameEn || item.nameAr);
  }

  cityName(cityId: number): string {
    const city = this.cities.find((c) => c.id === cityId);
    return city ? this.nameOf(city) : '—';
  }

  pagedItems(type: LookupType): LookupItem[] {
    const all = this.items[type];
    const start = this.pageIndex[type] * this.pageSize;
    return all.slice(start, start + this.pageSize);
  }

  loadCities(): void {
    this.citiesLoading = true;
    this.admin.getCities().subscribe({
      next: (items) => {
        this.cities = items;
        this.citiesLoading = false;
        this.loadAllAreas();
      },
      error: () => {
        this.cities = [];
        this.citiesLoading = false;
      }
    });
  }

  private loadAllAreas(): void {
    if (!this.cities.length) {
      this.areas = [];
      return;
    }
    this.areasLoading = true;
    const loads = this.cities.map((c) => this.admin.getAreas(c.id));
    let pending = loads.length;
    const merged: AdminArea[] = [];
    loads.forEach((req$) => {
      req$.subscribe({
        next: (items) => {
          merged.push(...items);
          pending -= 1;
          if (pending === 0) {
            this.areas = merged;
            this.areasLoading = false;
          }
        },
        error: () => {
          pending -= 1;
          if (pending === 0) {
            this.areas = merged;
            this.areasLoading = false;
          }
        }
      });
    });
  }

  selectCity(city: AdminCity): void {
    this.selectedCityId = city.id;
    this.areasPageIndex = 0;
  }

  onCityFilter(cityId: number | null): void {
    this.selectedCityId = cityId;
    this.areasPageIndex = 0;
  }

  openAddCity(): void {
    this.dialog.open(GeoItemDialogComponent, {
      width: '480px',
      data: { mode: 'city', cities: this.cities }
    }).afterClosed().subscribe((ok) => {
      if (ok) this.loadCities();
    });
  }

  openAddArea(): void {
    this.dialog.open(GeoItemDialogComponent, {
      width: '480px',
      data: {
        mode: 'area',
        cities: this.cities,
        defaultCityId: this.selectedCityId ?? this.cities[0]?.id ?? null
      }
    }).afterClosed().subscribe((ok) => {
      if (ok) this.loadAllAreas();
    });
  }

  openAdd(list: LookupListDef): void {
    this.dialog.open(LookupItemDialogComponent, {
      width: '520px',
      panelClass: 'app-dialog-panel',
      disableClose: true,
      data: { type: list.type, item: null }
    }).afterClosed().subscribe((ok) => {
      if (ok) this.loadType(list.type);
    });
  }

  openEdit(list: LookupListDef, item: LookupItem): void {
    this.dialog.open(LookupItemDialogComponent, {
      width: '520px',
      panelClass: 'app-dialog-panel',
      disableClose: true,
      data: { type: list.type, item }
    }).afterClosed().subscribe((ok) => {
      if (ok) this.loadType(list.type);
    });
  }

  remove(list: LookupListDef, item: LookupItem): void {
    if (item.locked) return;
    this.dialog.open(ConfirmDialogComponent, {
      width: '440px',
      data: {
        title: 'ACTIONS.DELETE',
        message: 'LOOKUPS.DELETE_CONFIRM',
        danger: true,
        confirmLabel: 'ACTIONS.DELETE'
      }
    }).afterClosed().subscribe((ok) => {
      if (!ok) return;
      this.deletingId = item.id;
      this.lookupService.delete(item.id).subscribe({
        next: () => {
          this.deletingId = null;
          this.snack.success(this.i18n.instant('COMMON.DELETED'));
          this.loadType(list.type);
        },
        error: (err: Error) => {
          this.deletingId = null;
          this.snack.error(err.message);
        }
      });
    });
  }

  private loadType(type: LookupType): void {
    this.loading[type] = true;
    this.lookupService.getAllByType(type).subscribe({
      next: (res) => {
        this.items[type] = res.data ?? [];
        this.loading[type] = false;
      },
      error: (err: Error) => {
        this.snack.error(err.message);
        this.loading[type] = false;
      }
    });
  }
}
