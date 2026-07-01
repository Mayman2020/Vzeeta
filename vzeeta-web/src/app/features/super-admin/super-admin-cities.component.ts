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
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { TablePagerComponent } from '../../shared/components/table-pager/table-pager.component';
import { TableRowIndexPipe } from '../../shared/pipes/table-row-index.pipe';
import { AdminArea, AdminCity, SuperAdminService } from '../../core/services/super-admin.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { GeoItemDialogComponent } from './geo-item-dialog.component';

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
  template: `
    <div class="app-page lookup-page">
      <app-page-header titleKey="NAV.CITIES" subtitleKey="ADMIN.CITIES_LOOKUP_HINT">
        <a mat-stroked-button routerLink="/super-admin/lookups">{{ 'ADMIN.LOOKUPS_LINK' | translate }}</a>
      </app-page-header>

      <mat-tab-group class="lookup-tabs" animationDuration="180ms">
        <mat-tab [label]="'LOOKUPS.TAB_GEO' | translate">
          <mat-accordion class="lookup-panel-stack" multi>
            <mat-expansion-panel class="lookup-box">
              <mat-expansion-panel-header>
                <mat-panel-title>
                  <span class="material-icons">location_city</span>
                  <span>{{ 'LOOKUPS.CITIES' | translate }}</span>
                  <span class="panel-count">{{ cities.length }}</span>
                </mat-panel-title>
              </mat-expansion-panel-header>

              <div class="lookup-box-head">
                <div>
                  <h2>{{ 'LOOKUPS.CITIES' | translate }}</h2>
                  <p>{{ 'LOOKUPS.ITEM_COUNT' | translate:{ count: cities.length } }}</p>
                </div>
                <div class="lookup-head-actions">
                  <button mat-flat-button color="primary" type="button" (click)="openAddCity()">
                    <mat-icon>add</mat-icon>
                    {{ 'LOOKUPS.ADD_CITY' | translate }}
                  </button>
                </div>
              </div>

              <div class="loading-center" *ngIf="citiesLoading">
                <mat-spinner diameter="32"></mat-spinner>
              </div>

              <div class="app-table-wrap" *ngIf="!citiesLoading && cities.length > 0">
                <table class="app-data-table">
                  <thead>
                    <tr>
                      <th class="table-index-col">#</th>
                      <th>{{ 'LOOKUPS.NAME_AR' | translate }}</th>
                      <th>{{ 'LOOKUPS.NAME_EN' | translate }}</th>
                      <th class="actions-col">{{ 'COMMON.ACTIONS' | translate }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let city of pagedCities; let i = index">
                      <td class="table-index-col">{{ i | tableRowIndex:citiesPageIndex:pageSize }}</td>
                      <td>{{ city.nameAr }}</td>
                      <td>{{ city.nameEn || '—' }}</td>
                      <td class="actions-col">
                        <div class="table-actions app-row-actions">
                          <button
                            type="button"
                            class="app-icon-btn accent"
                            (click)="selectCity(city)"
                            [matTooltip]="'ADMIN.MANAGE_AREAS' | translate">
                            <mat-icon>map</mat-icon>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p class="app-empty-state-inline" *ngIf="!citiesLoading && cities.length === 0">
                {{ 'COMMON.NO_DATA' | translate }}
              </p>

              <app-table-pager
                *ngIf="cities.length > 0"
                [length]="cities.length"
                [pageSize]="pageSize"
                [pageIndex]="citiesPageIndex"
                (pageIndexChange)="citiesPageIndex = $event">
              </app-table-pager>
            </mat-expansion-panel>

            <mat-expansion-panel class="lookup-box" [expanded]="!!selectedCityId">
              <mat-expansion-panel-header>
                <mat-panel-title>
                  <span class="material-icons">map</span>
                  <span>{{ 'LOOKUPS.AREAS' | translate }}</span>
                  <span class="panel-count">{{ filteredAreas.length }}</span>
                </mat-panel-title>
              </mat-expansion-panel-header>

              <div class="lookup-box-head">
                <div>
                  <h2>{{ 'LOOKUPS.AREAS' | translate }}</h2>
                  <p>{{ 'LOOKUPS.ITEM_COUNT' | translate:{ count: filteredAreas.length } }}</p>
                </div>
                <div class="lookup-head-actions">
                  <div class="lookup-actions">
                    <mat-form-field appearance="outline" class="filter-field lookup-filter" floatLabel="always" subscriptSizing="dynamic">
                      <mat-label>{{ 'LOOKUPS.CITY' | translate }}</mat-label>
                      <mat-select [value]="selectedCityId" (valueChange)="onCityFilter($event)">
                        <mat-option [value]="null">{{ 'COMMON.ALL' | translate }}</mat-option>
                        <mat-option *ngFor="let c of cities" [value]="c.id">{{ nameOf(c) }}</mat-option>
                      </mat-select>
                    </mat-form-field>
                    <button mat-flat-button color="primary" type="button" (click)="openAddArea()" [disabled]="!cities.length">
                      <mat-icon>add</mat-icon>
                      {{ 'LOOKUPS.ADD_AREA' | translate }}
                    </button>
                  </div>
                </div>
              </div>

              <div class="loading-center" *ngIf="areasLoading">
                <mat-spinner diameter="32"></mat-spinner>
              </div>

              <div class="app-table-wrap" *ngIf="!areasLoading && filteredAreas.length > 0">
                <table class="app-data-table">
                  <thead>
                    <tr>
                      <th class="table-index-col">#</th>
                      <th>{{ 'LOOKUPS.CITY' | translate }}</th>
                      <th>{{ 'LOOKUPS.NAME_AR' | translate }}</th>
                      <th>{{ 'LOOKUPS.NAME_EN' | translate }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let area of pagedAreas; let i = index">
                      <td class="table-index-col">{{ i | tableRowIndex:areasPageIndex:pageSize }}</td>
                      <td>{{ cityName(area.cityId) }}</td>
                      <td>{{ area.nameAr }}</td>
                      <td>{{ area.nameEn || '—' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p class="app-empty-state-inline" *ngIf="!areasLoading && filteredAreas.length === 0">
                {{ 'COMMON.NO_DATA' | translate }}
              </p>

              <app-table-pager
                *ngIf="filteredAreas.length > 0"
                [length]="filteredAreas.length"
                [pageSize]="pageSize"
                [pageIndex]="areasPageIndex"
                (pageIndexChange)="areasPageIndex = $event">
              </app-table-pager>
            </mat-expansion-panel>
          </mat-accordion>
        </mat-tab>
      </mat-tab-group>
    </div>
  `
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
