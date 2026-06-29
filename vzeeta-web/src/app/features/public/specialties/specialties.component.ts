import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { DoctorService } from '../../../core/services/doctor.service';
import { Specialty } from '../../../core/models/doctor.model';
import { I18nService } from '../../../core/i18n/i18n.service';

@Component({
  selector: 'app-specialties',
  standalone: true,
  imports: [NgFor, NgIf, MatIconModule],
  templateUrl: './specialties.component.html',
  styleUrl: './specialties.component.scss'
})
export class SpecialtiesComponent implements OnInit {
  specialties: Specialty[] = [];
  query = '';
  loading = true;

  constructor(
    private readonly doctorService: DoctorService,
    private readonly router: Router,
    readonly i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.doctorService.getSpecialties().subscribe((items) => {
      this.specialties = items;
      this.loading = false;
    });
  }

  get filteredSpecialties(): Specialty[] {
    const q = this.query.trim().toLowerCase();
    if (!q) return this.specialties;
    return this.specialties.filter((s) =>
      `${s.nameAr} ${s.nameEn} ${s.code ?? ''}`.toLowerCase().includes(q)
    );
  }

  label(s: Specialty): string {
    return this.i18n.currentLang === 'ar' ? s.nameAr : s.nameEn;
  }

  subtitle(): string {
    return this.i18n.currentLang === 'ar'
      ? 'اختار التخصص المناسب، وبعدها هنفتح لك أفضل الدكاترة المتاحين للحجز.'
      : 'Choose a specialty, then browse matching doctors ready for booking.';
  }

  searchPlaceholder(): string {
    return this.i18n.currentLang === 'ar' ? 'ابحث باسم التخصص' : 'Search specialty';
  }

  countLabel(): string {
    return this.i18n.currentLang === 'ar' ? 'تخصص طبي' : 'medical specialties';
  }

  openSpecialty(s: Specialty): void {
    void this.router.navigate(['/doctors'], { queryParams: { specialtyId: s.id } });
  }

  updateQuery(event: Event): void {
    this.query = (event.target as HTMLInputElement).value;
  }
}
