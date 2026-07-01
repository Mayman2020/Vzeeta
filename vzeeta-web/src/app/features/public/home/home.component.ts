import { Component, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { TranslateModule } from '@ngx-translate/core';
import { DoctorService } from '../../../core/services/doctor.service';
import { Specialty } from '../../../core/models/doctor.model';
import { I18nService } from '../../../core/i18n/i18n.service';
import { specialtyVisual } from '../../../core/utils/specialty-visuals.util';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    NgFor, NgIf, ReactiveFormsModule, RouterLink, TranslateModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatCardModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  searchForm: FormGroup;
  specialties: Specialty[] = [];
  @ViewChild('specialtyTrack', { static: false }) specialtyTrack?: ElementRef<HTMLElement>;
  private autoScrollInterval?: number;

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
      specialtyId: [null as number | null]
    });
  }

  ngOnInit(): void {
    this.doctorService.getSpecialties().subscribe({
      next: (s) => {
        this.specialties = s;
        setTimeout(() => this.startSpecialtyCarousel(), 500);
      },
      error: () => {}
    });
  }

  ngOnDestroy(): void {
    this.stopSpecialtyCarousel();
  }

  search(): void {
    const v = this.searchForm.value;
    void this.router.navigate(['/doctors'], {
      queryParams: {
        name: v.name || null,
        specialtyId: v.specialtyId || null
      }
    });
  }

  specialtyName(s: Specialty): string {
    return this.i18n.currentLang === 'ar' ? s.nameAr : s.nameEn;
  }

  specialtyMeta(s: Specialty) {
    return specialtyVisual(s);
  }

  browseSpecialty(s: Specialty): void {
    void this.router.navigate(['/doctors'], { queryParams: { specialtyId: s.id } });
  }

  scrollSpecialties(direction: number): void {
    if (!this.specialtyTrack) return;
    const amount = direction * -350; // Depending on physical alignment; negative shifts to "next" element in RTL
    this.specialtyTrack.nativeElement.scrollBy({ left: amount, behavior: 'smooth' });
  }

  startSpecialtyCarousel(): void {
    this.stopSpecialtyCarousel();
    if (this.specialties.length <= 1) return;
    const step = this.i18n.currentLang === 'ar' ? -1.5 : 1.5;
    this.autoScrollInterval = window.setInterval(() => {
      if (!this.specialtyTrack) return;
      const el = this.specialtyTrack.nativeElement;
      el.scrollBy({ left: step, behavior: 'auto' });
      // Reset scroll if tracking reached max width
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (Math.abs(el.scrollLeft) >= maxScroll - 3) {
        el.scrollTo({ left: 0, behavior: 'auto' });
      }
    }, 20);
  }

  stopSpecialtyCarousel(): void {
    if (this.autoScrollInterval) {
      window.clearInterval(this.autoScrollInterval);
      this.autoScrollInterval = undefined;
    }
  }
}
