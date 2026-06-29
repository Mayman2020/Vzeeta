import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { ApiResponse } from '../models/user.model';
import { Appointment } from '../models/appointment.model';
import { PagedResult, parsePageResponse } from '../utils/api-page.util';

export interface DoctorAvailability {
  id: number;
  doctorId: number;
  branchId?: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotMinutes: number;
  onlineOnly: boolean;
  active: boolean;
}

export interface DoctorEarnings {
  totalEarnings: number;
  paymentCount: number;
}

@Injectable({ providedIn: 'root' })
export class DoctorPortalService {
  constructor(private readonly api: ApiService) {}

  getAppointments(params: Record<string, string | number | boolean> = {}): Observable<PagedResult<Appointment>> {
    return this.api.get<ApiResponse<unknown>>(AppConstants.API.DOCTOR_APPOINTMENTS, params).pipe(
      map((res) => parsePageResponse<Appointment>(res.data))
    );
  }

  acceptAppointment(id: number): Observable<Appointment> {
    return this.api.post<ApiResponse<Appointment>>(`${AppConstants.API.DOCTOR_APPOINTMENTS}/${id}/accept`, {}).pipe(
      map((res) => res.data!)
    );
  }

  rejectAppointment(id: number, reason?: string): Observable<Appointment> {
    const query = reason ? `?reason=${encodeURIComponent(reason)}` : '';
    return this.api.post<ApiResponse<Appointment>>(`${AppConstants.API.DOCTOR_APPOINTMENTS}/${id}/reject${query}`, {}).pipe(
      map((res) => res.data!)
    );
  }

  getAvailability(): Observable<DoctorAvailability[]> {
    return this.api.get<ApiResponse<DoctorAvailability[]>>(AppConstants.API.DOCTOR_AVAILABILITY).pipe(
      map((res) => res.data ?? [])
    );
  }

  saveAvailability(slot: Partial<DoctorAvailability>): Observable<DoctorAvailability> {
    return this.api.post<ApiResponse<DoctorAvailability>>(AppConstants.API.DOCTOR_AVAILABILITY, slot).pipe(
      map((res) => res.data!)
    );
  }

  getEarnings(): Observable<DoctorEarnings> {
    return this.api.get<ApiResponse<DoctorEarnings>>(AppConstants.API.DOCTOR_EARNINGS).pipe(
      map((res) => res.data ?? { totalEarnings: 0, paymentCount: 0 })
    );
  }

  getPrescriptions(params: Record<string, string | number | boolean> = {}): Observable<PagedResult<Record<string, unknown>>> {
    return this.api.get<ApiResponse<unknown>>(AppConstants.API.DOCTOR_PRESCRIPTIONS, params).pipe(
      map((res) => parsePageResponse<Record<string, unknown>>(res.data))
    );
  }

  createPrescription(body: Record<string, unknown>): Observable<Record<string, unknown>> {
    return this.api.post<ApiResponse<Record<string, unknown>>>(AppConstants.API.DOCTOR_PRESCRIPTIONS, body).pipe(
      map((res) => res.data ?? {})
    );
  }
}
