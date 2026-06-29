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

@Component({
  selector: 'app-doctor-search',
  standalone: true,
  imports: [
    NgFor, NgIf, ReactiveFormsModule, RouterLink, TranslateModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatCardModule, MatChipsModule,
    LoadingSpinnerComponent
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

  constructor(
    fb: FormBuilder,
    private readonly doctorService: DoctorService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
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
    this.doctorService.getSpecialties().subscribe((s) => (this.specialties = s));
    this.doctorService.getCities().subscribe((c) => (this.cities = c));

    this.filters.get('cityId')?.valueChanges.subscribe((cityId: number | null) => {
      this.filters.patchValue({ areaId: null }, { emitEvent: false });
      if (cityId) {
        this.doctorService.getAreas(cityId).subscribe((a) => (this.areas = a));
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
      if (patch['cityId']) {
        this.doctorService.getAreas(Number(patch['cityId'])).subscribe((a) => (this.areas = a));
      }
      this.loadDoctors();
    });
  }

  loadDoctors(): void {
    this.loading = true;
    const v = this.filters.value;
    this.doctorService.search({
      name: v.name || undefined,
      specialtyId: v.specialtyId || undefined,
      areaId: v.areaId || undefined,
      minPrice: v.minPrice,
      maxPrice: v.maxPrice,
      consultationType: v.consultationType,
      minRating: v.minRating || undefined
    }).subscribe((docs) => {
      this.doctors = docs;
      this.loading = false;
    });
  }

  applyFilters(): void {
    const v = this.filters.value;
    void this.router.navigate([], {
      queryParams: {
        name: v.name || null,
        specialtyId: v.specialtyId || null,
        cityId: v.cityId || null,
        areaId: v.areaId || null,
        consultationType: v.consultationType !== 'ALL' ? v.consultationType : null,
        minRating: v.minRating || null
      },
      relativeTo: this.route
    });
  }

  doctorName(d: Doctor): string {
    return this.i18n.currentLang === 'ar' ? (d.fullNameAr || d.fullName) : (d.fullNameEn || d.fullName);
  }

  specialtyLabel(s: Specialty): string {
    return this.i18n.currentLang === 'ar' ? s.nameAr : s.nameEn;
  }

  lookupLabel(item: LookupItem): string {
    return this.i18n.currentLang === 'ar' ? item.nameAr : (item.nameEn || item.nameAr);
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
