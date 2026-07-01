import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { TranslateModule } from '@ngx-translate/core';
import { DoctorService } from '../../../core/services/doctor.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { PaymentService } from '../../../core/services/payment.service';
import { Doctor, TimeSlot } from '../../../core/models/doctor.model';
import { ConsultationType } from '../../../core/models/appointment.model';
import { SnackService } from '../../../core/services/snack.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { AuthService } from '../../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { DateFieldComponent } from '../../../shared/components/date-field/date-field.component';
import { switchMap } from 'rxjs';
import { formatApiDate } from '../../../core/utils/date-value.utils';
import { RmsDatePipe } from '../../../shared/pipes/rms-date.pipe';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [
    NgFor, NgIf, RmsDatePipe, ReactiveFormsModule, TranslateModule, RouterLink,
    MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatCardModule, MatChipsModule, MatButtonToggleModule,
    LoadingSpinnerComponent, DateFieldComponent
  ],
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.scss'
})
export class BookingComponent implements OnInit {
  doctor: Doctor | null = null;
  slots: TimeSlot[] = [];
  selectedSlot: TimeSlot | null = null;
  form: FormGroup;
  step = 1;
  loading = true;
  booking = false;
  consultationType: ConsultationType = 'IN_CLINIC';

  constructor(
    fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly doctorService: DoctorService,
    private readonly appointmentService: AppointmentService,
    private readonly paymentService: PaymentService,
    private readonly snack: SnackService,
    private readonly auth: AuthService,
    readonly i18n: I18nService
  ) {
    this.form = fb.group({
      date: [formatApiDate(new Date()), Validators.required],
      notes: ['']
    });
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('doctorId'));
    this.doctorService.getById(id).subscribe((d) => {
      this.doctor = d;
      this.loading = false;
      if (d) this.loadSlots();
    });
    this.form.get('date')?.valueChanges.subscribe(() => this.loadSlots());
  }

  loadSlots(): void {
    if (!this.doctor) return;
    const date = this.formatDate(this.form.get('date')?.value);
    this.doctorService.getTimeSlots(this.doctor.id, date, this.consultationType).subscribe((s) => {
      this.slots = s;
      this.selectedSlot = null;
    });
  }

  onConsultationTypeChange(type: ConsultationType): void {
    this.consultationType = type;
    this.loadSlots();
  }

  selectSlot(slot: TimeSlot): void {
    if (slot.available) this.selectedSlot = slot;
  }

  nextStep(): void {
    if (this.step === 1 && this.selectedSlot) this.step = 2;
  }

  confirm(): void {
    if (!this.auth.isAuthenticated()) {
      this.snack.info(this.i18n.instant('BOOKING.LOGIN_REQUIRED'));
      void this.router.navigate(['/auth/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    if (!this.doctor || !this.selectedSlot) return;

    this.booking = true;
    this.appointmentService.book({
      doctorId: this.doctor.id,
      specialtyId: this.doctor.specialtyIds?.[0],
      appointmentDate: this.formatDate(this.form.get('date')?.value),
      startTime: this.selectedSlot.startTime,
      consultationType: this.consultationType,
      notes: this.form.get('notes')?.value || undefined
    }).pipe(
      switchMap((appt) => this.paymentService.createPayment(appt.id, 'ONLINE'))
    ).subscribe({
      next: () => {
        this.booking = false;
        this.snack.success(this.i18n.instant('BOOKING.SUCCESS'));
        void this.router.navigate(['/patient/appointments']);
      },
      error: (err: Error) => {
        this.booking = false;
        this.snack.error(err.message || this.i18n.instant('BOOKING.FAILED'));
      }
    });
  }

  doctorName(): string {
    if (!this.doctor) return '';
    return this.i18n.currentLang === 'ar'
      ? (this.doctor.fullNameAr || this.doctor.fullName)
      : (this.doctor.fullNameEn || this.doctor.fullName);
  }

  displayFee(): number {
    if (!this.doctor) return 0;
    return this.consultationType === 'ONLINE' && this.doctor.onlineFee
      ? this.doctor.onlineFee
      : this.doctor.consultationFee;
  }

  private formatDate(d: string | Date | null | undefined): string {
    if (!d) return '';
    if (typeof d === 'string') return d;
    return formatApiDate(d);
  }
}
