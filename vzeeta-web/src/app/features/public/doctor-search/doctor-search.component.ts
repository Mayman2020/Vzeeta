import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { TranslateModule } from '@ngx-translate/core';
import { DoctorService } from '../../../core/services/doctor.service';
import { Doctor, LookupItem, Specialty } from '../../../core/models/doctor.model';
import { I18nService } from '../../../core/i18n/i18n.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { TablePagerComponent } from '../../../shared/components/table-pager/table-pager.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { DEFAULT_TABLE_PAGE_SIZE } from '../../../core/utils/pagination.util';
import { SnackService } from '../../../core/services/snack.service';

@Component({
  selector: 'app-doctor-search',
  standalone: true,
  imports: [
    NgFor, NgIf, ReactiveFormsModule, RouterLink, TranslateModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatCardModule, MatChipsModule,
    LoadingSpinnerComponent, TablePagerComponent, EmptyStateComponent
  ],
  templateUrl: './doctor-search.component.html',
  styleUrl: './doctor-search.component.scss'
})
export class DoctorSearchComponent implements OnInit {
  filters: FormGroup;
  doctors: Doctor[] = [];
  specialties: Specialty[] = [];
  cities: LookupItem[] = [];
  areas: LookupItem[] = [];
  loading = false;
  loadError = false;
  selectedSpecialtyId: number | null = null;
  pageIndex = 0;
  pageSize = DEFAULT_TABLE_PAGE_SIZE;
  totalElements = 0;
  sortBy: 'relevance' | 'rating' | 'nearest' = 'relevance';
  userLocation: { lat: number; lng: number } | null = null;
  locatingUser = false;

  constructor(
    fb: FormBuilder,
    private readonly doctorService: DoctorService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly snack: SnackService,
    readonly i18n: I18nService
  ) {
    this.filters = fb.group({
      name: [''],
      specialtyId: [null as number | null],
      cityId: [null as number | null],
      areaId: [null as number | null],
      minPrice: [0],
      maxPrice: [2000],
      consultationType: ['ALL'],
      minRating: [0]
    });
  }

  ngOnInit(): void {
    this.doctorService.getSpecialties().subscribe({
      next: (s) => (this.specialties = s),
      error: () => this.snack.error(this.i18n.instant('ERRORS.NETWORK_ERROR'))
    });
    this.doctorService.getCities().subscribe({
      next: (c) => (this.cities = c),
      error: () => this.snack.error(this.i18n.instant('ERRORS.NETWORK_ERROR'))
    });

    this.filters.get('cityId')?.valueChanges.subscribe((cityId: number | null) => {
      this.filters.patchValue({ areaId: null }, { emitEvent: false });
      if (cityId) {
        this.doctorService.getAreas(cityId).subscribe({
          next: (a) => (this.areas = a),
          error: () => this.snack.error(this.i18n.instant('ERRORS.NETWORK_ERROR'))
        });
      } else {
        this.areas = [];
      }
    });

    this.route.queryParams.subscribe((params) => {
      const patch: Record<string, unknown> = { ...params };
      if (params['specialtyId']) patch['specialtyId'] = Number(params['specialtyId']);
      if (params['areaId']) patch['areaId'] = Number(params['areaId']);
      if (params['cityId']) patch['cityId'] = Number(params['cityId']);
      this.filters.patchValue(patch, { emitEvent: false });
      this.selectedSpecialtyId = (patch['specialtyId'] as number | undefined) ?? null;
      this.pageIndex = Number(params['page'] ?? 0);
      if (patch['cityId']) {
        this.doctorService.getAreas(Number(patch['cityId'])).subscribe({
          next: (a) => (this.areas = a),
          error: () => {}
        });
      }
      this.loadDoctors();
    });
  }

  loadDoctors(): void {
    this.loading = true;
    this.loadError = false;
    const v = this.filters.value;
    this.doctorService.search({
      name: v.name || undefined,
      specialtyId: v.specialtyId || undefined,
      cityId: v.cityId || undefined,
      areaId: v.areaId || undefined,
      minPrice: v.minPrice,
      maxPrice: v.maxPrice,
      consultationType: v.consultationType,
      minRating: v.minRating || undefined
    }, this.pageIndex, this.pageSize).subscribe({
      next: (res) => {
        this.doctors = this.sortBy === 'rating'
          ? [...res.content].sort((a, b) => b.rating - a.rating)
          : res.content;
        this.totalElements = res.totalElements;
        this.loading = false;
      },
      error: () => {
        this.doctors = [];
        this.totalElements = 0;
        this.loadError = true;
        this.loading = false;
        this.snack.error(this.i18n.instant('ERRORS.NETWORK_ERROR'));
      }
    });
  }

  applyFilters(): void {
    this.pageIndex = 0;
    const v = this.filters.value;
    void this.router.navigate([], {
      queryParams: {
        name: v.name || null,
        specialtyId: v.specialtyId || null,
        cityId: v.cityId || null,
        areaId: v.areaId || null,
        consultationType: v.consultationType !== 'ALL' ? v.consultationType : null,
        minRating: v.minRating || null,
        page: null
      },
      relativeTo: this.route
    });
  }

  onPageChange(index: number): void {
    this.pageIndex = index;
    void this.router.navigate([], {
      queryParams: { page: index || null },
      queryParamsHandling: 'merge',
      relativeTo: this.route
    });
  }

  setSort(mode: 'relevance' | 'rating' | 'nearest'): void {
    this.sortBy = mode;
    if (mode === 'rating') {
      this.doctors = [...this.doctors].sort((a, b) => b.rating - a.rating);
    } else if (mode === 'nearest') {
      this.sortByNearest();
    } else {
      this.loadDoctors();
    }
  }

  private sortByNearest(): void {
    if (this.userLocation) {
      this.applyNearestSort();
      return;
    }
    if (!('geolocation' in navigator)) {
      this.snack.error(this.i18n.instant('SEARCH.LOCATION_UNAVAILABLE'));
      this.sortBy = 'relevance';
      return;
    }
    this.locatingUser = true;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.userLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        this.locatingUser = false;
        this.applyNearestSort();
      },
      () => {
        this.locatingUser = false;
        this.snack.error(this.i18n.instant('SEARCH.LOCATION_DENIED'));
        this.sortBy = 'relevance';
      },
      { timeout: 10000 }
    );
  }

  private applyNearestSort(): void {
    if (!this.userLocation) return;
    this.doctors = [...this.doctors].sort((a, b) => this.nearestScore(a) - this.nearestScore(b));
  }

  /** Lower score = better: closer doctors rank first, with rating as a tiebreak/refinement (each star ~ worth 2km closer). */
  private nearestScore(d: Doctor): number {
    const distance = this.distanceKm(d);
    if (distance === null) return Number.POSITIVE_INFINITY;
    return distance - (d.rating || 0) * 2;
  }

  private distanceKm(d: Doctor): number | null {
    if (!this.userLocation || d.latitude == null || d.longitude == null) return null;
    const R = 6371;
    const dLat = this.toRad(d.latitude - this.userLocation.lat);
    const dLng = this.toRad(d.longitude - this.userLocation.lng);
    const lat1 = this.toRad(this.userLocation.lat);
    const lat2 = this.toRad(d.latitude);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return (deg * Math.PI) / 180;
  }

  distanceLabel(d: Doctor): string | null {
    const km = this.distanceKm(d);
    return km === null ? null : `${km.toFixed(1)} ${this.i18n.instant('SEARCH.KM_AWAY')}`;
  }

  doctorName(d: Doctor): string {
    return this.i18n.currentLang === 'ar' ? (d.fullNameAr || d.fullName) : (d.fullNameEn || d.fullName);
  }

  doctorTitle(d: Doctor): string {
    return this.i18n.currentLang === 'ar' ? (d.titleAr || d.specialty) : (d.titleEn || d.specialty);
  }

  specialtyLabel(s: Specialty): string {
    return this.i18n.currentLang === 'ar' ? s.nameAr : s.nameEn;
  }

  selectedSpecialtyLabel(): string {
    if (!this.selectedSpecialtyId) return '';
    const specialty = this.specialties.find((s) => s.id === this.selectedSpecialtyId);
    return specialty ? this.specialtyLabel(specialty) : '';
  }

  resultsTitle(): string {
    const label = this.selectedSpecialtyLabel();
    if (!label) return this.i18n.instant('SEARCH.ALL_DOCTORS');
    return this.i18n.instant('SEARCH.SPECIALTY_DOCTORS', { specialty: label });
  }

  resultsSubtitle(): string {
    return this.i18n.instant('SEARCH.FILTERS_HINT');
  }

  lookupLabel(item: LookupItem): string {
    return this.i18n.currentLang === 'ar' ? item.nameAr : (item.nameEn || item.nameAr);
  }

  clearFilters(): void {
    this.filters.reset({
      name: '', specialtyId: null, cityId: null, areaId: null,
      minPrice: 0, maxPrice: 2000, consultationType: 'ALL', minRating: 0
    });
    this.areas = [];
    this.applyFilters();
  }

  consultationLabel(type: string): string {
    const map: Record<string, string> = {
      IN_CLINIC: 'SEARCH.IN_CLINIC',
      ONLINE: 'SEARCH.ONLINE',
      BOTH: 'SEARCH.BOTH'
    };
    return map[type] || type;
  }
}
