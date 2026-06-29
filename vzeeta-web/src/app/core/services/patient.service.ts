import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { ApiResponse } from '../models/user.model';
import { Doctor } from '../models/doctor.model';
import { Appointment } from '../models/appointment.model';
import { PagedResult, parsePageResponse } from '../utils/api-page.util';

export interface NotificationItem {
  id: number;
  type: string;
  titleAr: string;
  titleEn?: string;
  bodyAr?: string;
  bodyEn?: string;
  readFlag: boolean;
  createdAt: string;
}

export interface PrescriptionItem {
  id: number;
  medicineName: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
}

export interface Prescription {
  id: number;
  diagnosisAr?: string;
  diagnosisEn?: string;
  notes?: string;
  createdAt: string;
  items: PrescriptionItem[];
}

export interface LabResult {
  id: number;
  testNameAr: string;
  testNameEn?: string;
  resultSummary?: string;
  resultDate: string;
  fileUrl?: string;
  attachmentUrl?: string;
}

export interface MedicalRecord {
  id: number;
  titleAr: string;
  titleEn?: string;
  descriptionAr?: string;
  recordType: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class PatientService {
  constructor(private readonly api: ApiService) {}

  getAppointments(params: Record<string, string | number | boolean> = {}): Observable<PagedResult<Appointment>> {
    return this.paged<Appointment>(AppConstants.API.MY_APPOINTMENTS, params);
  }

  getFavorites(): Observable<Doctor[]> {
    return this.api.get<ApiResponse<Record<string, unknown>[]>>(AppConstants.API.PATIENT_FAVORITES).pipe(
      map((res) => (res.data ?? []).map((d) => this.mapFavoriteDoctor(d)))
    );
  }

  private mapFavoriteDoctor(raw: Record<string, unknown>): Doctor {
    const specialtyNames = (raw['specialtyNames'] as string[]) ?? [];
    return {
      id: raw['id'] as number,
      fullName: (raw['fullNameEn'] as string) || (raw['fullNameAr'] as string) || '',
      fullNameAr: raw['fullNameAr'] as string,
      fullNameEn: raw['fullNameEn'] as string,
      specialty: specialtyNames[0] ?? '',
      area: (raw['areaNameAr'] as string) ?? '',
      rating: Number(raw['ratingAvg'] ?? 0),
      reviewCount: Number(raw['ratingCount'] ?? 0),
      consultationFee: Number(raw['consultationFee'] ?? 0),
      consultationType: 'BOTH',
      clinicName: raw['clinicNameAr'] as string
    };
  }

  addFavorite(doctorId: number): Observable<void> {
    return this.api.post<ApiResponse<void>>(`${AppConstants.API.PATIENT_FAVORITES}/${doctorId}`, {}).pipe(map(() => undefined));
  }

  removeFavorite(doctorId: number): Observable<void> {
    return this.api.delete<ApiResponse<void>>(`${AppConstants.API.PATIENT_FAVORITES}/${doctorId}`).pipe(map(() => undefined));
  }

  getPrescriptions(params: Record<string, string | number | boolean> = {}): Observable<PagedResult<Prescription>> {
    return this.paged<Prescription>(AppConstants.API.PATIENT_PRESCRIPTIONS, params);
  }

  getLabResults(params: Record<string, string | number | boolean> = {}): Observable<PagedResult<LabResult>> {
    return this.paged<LabResult>(AppConstants.API.PATIENT_LAB_RESULTS, params);
  }

  getMedicalRecords(params: Record<string, string | number | boolean> = {}): Observable<PagedResult<MedicalRecord>> {
    return this.paged<MedicalRecord>(AppConstants.API.PATIENT_RECORDS, params);
  }

  getNotifications(params: Record<string, string | number | boolean> = {}): Observable<PagedResult<NotificationItem>> {
    return this.paged<NotificationItem>(AppConstants.API.NOTIFICATIONS, params);
  }

  markNotificationRead(id: number): Observable<void> {
    return this.api.patch<ApiResponse<void>>(`${AppConstants.API.NOTIFICATIONS}/${id}/read`).pipe(map(() => undefined));
  }

  private paged<T>(path: string, params: Record<string, string | number | boolean>): Observable<PagedResult<T>> {
    return this.api.get<ApiResponse<unknown>>(path, params).pipe(
      map((res) => parsePageResponse<T>(res.data))
    );
  }
}
