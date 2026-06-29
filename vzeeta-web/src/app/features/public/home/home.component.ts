import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgFor } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { TranslateModule } from '@ngx-translate/core';
import { DoctorService } from '../../../core/services/doctor.service';
import { Specialty } from '../../../core/models/doctor.model';
import { I18nService } from '../../../core/i18n/i18n.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    NgFor, ReactiveFormsModule, RouterLink, TranslateModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatCardModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  searchForm: FormGroup;
  specialties: Specialty[] = [];

  readonly valueProps = [
    { icon: 'schedule', titleKey: 'HOME.VALUE1_TITLE', descKey: 'HOME.VALUE1_DESC' },
    { icon: 'verified_user', titleKey: 'HOME.VALUE2_TITLE', descKey: 'HOME.VALUE2_DESC' },
    { icon: 'medical_services', titleKey: 'HOME.VALUE3_TITLE', descKey: 'HOME.VALUE3_DESC' },
    { icon: 'support_agent', titleKey: 'HOME.VALUE4_TITLE', descKey: 'HOME.VALUE4_DESC' }
  ];

  constructor(
    fb: FormBuilder,
    private readonly doctorService: DoctorService,
    private readonly router: Router,
    readonly i18n: I18nService
  ) {
    this.searchForm = fb.group({
      name: [''],
      specialty: [''],
      area: ['']
    });
  }

  ngOnInit(): void {
    this.doctorService.getSpecialties().subscribe((s) => (this.specialties = s));
  }

  search(): void {
    const v = this.searchForm.value;
    void this.router.navigate(['/doctors'], { queryParams: v });
  }

  specialtyName(s: Specialty): string {
    return this.i18n.currentLang === 'ar' ? s.nameAr : s.nameEn;
  }

  browseSpecialty(s: Specialty): void {
    void this.router.navigate(['/doctors'], { queryParams: { specialtyId: s.id } });
  }
}
