import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { ApiResponse } from '../models/user.model';
import { Appointment } from '../models/appointment.model';
import { PagedResult, parsePageResponse } from '../utils/api-page.util';

export interface ClinicDoctor {
  id: number;
  titleAr?: string;
  titleEn?: string;
  consultationFee?: number;
  verified?: boolean;
  clinicId?: number;
  user?: { fullNameAr?: string; fullNameEn?: string; email?: string; phone?: string };
}

export interface CreateDoctorRequest {
  fullNameAr: string;
  fullNameEn?: string;
  email: string;
  phone?: string;
  titleAr?: string;
  consultationFee?: number;
  acceptsOnline?: boolean;
  acceptsInClinic?: boolean;
}

export interface ClinicBranch {
  id: number;
  clinicId: number;
  nameAr: string;
  nameEn?: string;
  phone?: string;
  active: boolean;
}

export interface ClinicServiceItem {
  id: number;
  clinicId: number;
  nameAr: string;
  nameEn?: string;
  price: number;
  active: boolean;
}

export interface ClinicPatient {
  id: number;
  user?: { fullNameAr?: string; fullNameEn?: string; email?: string; phone?: string };
}

export interface ClinicSpecialty {
  id: number;
  nameAr: string;
  nameEn?: string;
  active: boolean;
  sortOrder?: number;
}

export interface ClinicLabResult {
  id: number;
  testNameAr: string;
  testNameEn?: string;
  resultSummary?: string;
  resultDate: string;
  patientId: number;
}

export interface ClinicAnalytics {
  doctorCount: number;
  branchCount: number;
  appointmentCount: number;
  todayCount: number;
  cancelledCount: number;
  pendingCount: number;
}

@Injectable({ providedIn: 'root' })
export class ClinicAdminService {
  constructor(private readonly api: ApiService) {}

  getDoctors(params: Record<string, string | number | boolean> = {}): Observable<PagedResult<ClinicDoctor>> {
    return this.api.get<ApiResponse<unknown>>(AppConstants.API.CLINIC_DOCTORS, params).pipe(
      map((res) => parsePageResponse<ClinicDoctor>(res.data))
    );
  }

  createDoctor(req: CreateDoctorRequest): Observable<ClinicDoctor> {
    return this.api.post<ApiResponse<ClinicDoctor>>(AppConstants.API.CLINIC_DOCTORS, req).pipe(
      map((res) => res.data!)
    );
  }

  updateDoctor(id: number, doctor: Partial<ClinicDoctor>): Observable<ClinicDoctor> {
    return this.api.put<ApiResponse<ClinicDoctor>>(`${AppConstants.API.CLINIC_DOCTORS}/${id}`, doctor).pipe(
      map((res) => res.data!)
    );
  }

  getBranches(params: Record<string, string | number | boolean> = {}): Observable<PagedResult<ClinicBranch>> {
    return this.api.get<ApiResponse<unknown>>(AppConstants.API.CLINIC_BRANCHES, params).pipe(
      map((res) => parsePageResponse<ClinicBranch>(res.data))
    );
  }

  saveBranch(branch: Partial<ClinicBranch>): Observable<ClinicBranch> {
    return this.api.post<ApiResponse<ClinicBranch>>(AppConstants.API.CLINIC_BRANCHES, branch).pipe(
      map((res) => res.data!)
    );
  }

  getAppointments(params: Record<string, string | number | boolean> = {}): Observable<PagedResult<Appointment>> {
    return this.api.get<ApiResponse<unknown>>(AppConstants.API.CLINIC_APPOINTMENTS, params).pipe(
      map((res) => parsePageResponse<Appointment>(res.data))
    );
  }

  getPatients(params: Record<string, string | number | boolean> = {}): Observable<PagedResult<ClinicPatient>> {
    return this.api.get<ApiResponse<unknown>>(AppConstants.API.CLINIC_PATIENTS, params).pipe(
      map((res) => parsePageResponse<ClinicPatient>(res.data))
    );
  }

  getServices(params: Record<string, string | number | boolean> = {}): Observable<PagedResult<ClinicServiceItem>> {
    return this.api.get<ApiResponse<unknown>>(AppConstants.API.CLINIC_SERVICES, params).pipe(
      map((res) => parsePageResponse<ClinicServiceItem>(res.data))
    );
  }

  saveService(service: Partial<ClinicServiceItem>): Observable<ClinicServiceItem> {
    return this.api.post<ApiResponse<ClinicServiceItem>>(AppConstants.API.CLINIC_SERVICES, service).pipe(
      map((res) => res.data!)
    );
  }

  getSpecialties(): Observable<ClinicSpecialty[]> {
    return this.api.get<ApiResponse<ClinicSpecialty[]>>(AppConstants.API.CLINIC_SPECIALTIES).pipe(
      map((res) => res.data ?? [])
    );
  }

  getLabResults(params: Record<string, string | number | boolean> = {}): Observable<PagedResult<ClinicLabResult>> {
    return this.api.get<ApiResponse<unknown>>(AppConstants.API.CLINIC_LAB_RESULTS, params).pipe(
      map((res) => parsePageResponse<ClinicLabResult>(res.data))
    );
  }

  createLabResult(result: {
    patientId: number;
    testNameAr: string;
    testNameEn?: string;
    resultSummary?: string;
    resultDate: string;
  }): Observable<ClinicLabResult> {
    return this.api.post<ApiResponse<ClinicLabResult>>(AppConstants.API.CLINIC_LAB_RESULTS, result).pipe(
      map((res) => res.data!)
    );
  }

  getAnalytics(): Observable<ClinicAnalytics> {
    return this.api.get<ApiResponse<ClinicAnalytics>>(AppConstants.API.CLINIC_ANALYTICS).pipe(
      map((res) => res.data ?? { doctorCount: 0, branchCount: 0, appointmentCount: 0, todayCount: 0, cancelledCount: 0, pendingCount: 0 })
    );
  }
}
