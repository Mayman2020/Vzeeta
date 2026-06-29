import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { TranslateModule } from '@ngx-translate/core';
import { DoctorService } from '../../../core/services/doctor.service';
import { Doctor } from '../../../core/models/doctor.model';
import { I18nService } from '../../../core/i18n/i18n.service';

@Component({
  selector: 'app-doctor-profile',
  standalone: true,
  imports: [NgIf, RouterLink, TranslateModule, MatButtonModule, MatIconModule, MatCardModule, MatChipsModule],
  templateUrl: './doctor-profile.component.html',
  styleUrl: './doctor-profile.component.scss'
})
export class DoctorProfileComponent implements OnInit {
  doctor: Doctor | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly doctorService: DoctorService,
    readonly i18n: I18nService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.doctorService.getById(id).subscribe((d) => (this.doctor = d));
  }

  name(): string {
    if (!this.doctor) return '';
    return this.i18n.currentLang === 'ar' ? (this.doctor.fullNameAr || this.doctor.fullName) : this.doctor.fullName;
  }
}
