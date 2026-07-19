import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
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
import { AdminArea, AdminCity, SuperAdminService } from '../../../core/services/super-admin.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { GeoItemDialogComponent } from '../geo-item-dialog/geo-item-dialog.component';

const LOOKUP_PAGE_SIZE = 5;

@Component({
  selector: 'app-super-admin-cities',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    RouterLink,
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
  templateUrl: './super-admin-cities.component.html'
})
export class SuperAdminCitiesComponent implements OnInit {
  readonly pageSize = LOOKUP_PAGE_SIZE;
  cities: AdminCity[] = [];
  areas: AdminArea[] = [];
  selectedCityId: number | null = null;
  citiesLoading = true;
  areasLoading = false;
  citiesPageIndex = 0;
  areasPageIndex = 0;

  constructor(
    private readonly admin: SuperAdminService,
    private readonly i18n: I18nService,
    private readonly dialog: MatDialog
  ) {}

  ngOnInit(): void {
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
}
