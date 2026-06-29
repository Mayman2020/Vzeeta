import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { DoctorService } from '../../core/services/doctor.service';
import { Doctor, LookupItem, Specialty } from '../../core/models/doctor.model';
import { I18nService } from '../../core/i18n/i18n.service';

@Component({
  selector: 'app-doctor-finder-dialog',
  standalone: true,
  imports: [NgFor, NgIf, ReactiveFormsModule, MatButtonModule, MatDialogModule, MatIconModule],
  templateUrl: './doctor-finder-dialog.component.html',
  styleUrl: './doctor-finder-dialog.component.scss'
})
export class DoctorFinderDialogComponent implements OnInit {
  form: FormGroup;
  specialties: Specialty[] = [];
  doctors: Doctor[] = [];
  cities: LookupItem[] = [];
  areas: LookupItem[] = [];
  loadingDoctors = false;

  constructor(
    fb: FormBuilder,
    private readonly doctorService: DoctorService,
    private readonly router: Router,
    private readonly dialogRef: MatDialogRef<DoctorFinderDialogComponent>,
    readonly i18n: I18nService
  ) {
    this.form = fb.group({
      specialtyId: [null as number | null],
      doctorId: [null as number | null],
      cityId: [null as number | null],
      areaId: [null as number | null]
    });
  }

  ngOnInit(): void {
    this.doctorService.getSpecialties().subscribe((items) => (this.specialties = items));
    this.doctorService.getCities().subscribe((items) => (this.cities = items));

    this.form.get('specialtyId')?.valueChanges.subscribe((specialtyId: number | null) => {
      this.form.patchValue({ doctorId: null }, { emitEvent: false });
      this.loadDoctors(specialtyId);
    });

    this.form.get('cityId')?.valueChanges.subscribe((cityId: number | null) => {
      this.form.patchValue({ areaId: null }, { emitEvent: false });
      this.areas = [];
      if (cityId) this.doctorService.getAreas(cityId).subscribe((items) => (this.areas = items));
    });
  }

  private loadDoctors(specialtyId: number | null): void {
    this.doctors = [];
    if (!specialtyId) return;
    this.loadingDoctors = true;
    this.doctorService.search({ specialtyId }).subscribe((items) => {
      this.doctors = items;
      this.loadingDoctors = false;
    });
  }

  labelSpecialty(item: Specialty): string {
    return this.i18n.currentLang === 'ar' ? item.nameAr : item.nameEn;
  }

  labelLookup(item: LookupItem): string {
    return this.i18n.currentLang === 'ar' ? item.nameAr : (item.nameEn || item.nameAr);
  }

  labelDoctor(item: Doctor): string {
    return this.i18n.currentLang === 'ar'
      ? (item.fullNameAr || item.fullName)
      : (item.fullNameEn || item.fullName);
  }

  selectedSpecialtyName(): string {
    const id = this.form.value.specialtyId;
    const specialty = this.specialties.find((item) => item.id === id);
    return specialty ? this.labelSpecialty(specialty) : '';
  }

  submit(): void {
    const value = this.form.value;
    this.dialogRef.close();

    if (value.doctorId) {
      void this.router.navigate(['/doctors', value.doctorId]);
      return;
    }

    void this.router.navigate(['/doctors'], {
      queryParams: {
        specialtyId: value.specialtyId || null,
        cityId: value.cityId || null,
        areaId: value.areaId || null
      }
    });
  }
}
