import { Injectable } from '@angular/core';
import { Observable, tap, timeout } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { ApiResponse } from '../models/user.model';
import { PagedResult, parsePageResponse } from '../utils/api-page.util';

export interface AdminClinic {
  id: number;
  nameAr: string;
  nameEn?: string;
  phone?: string;
  email?: string;
  active: boolean;
  verified: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: number;
  updatedBy?: number;
}

export interface AdminCity {
  id: number;
  nameAr: string;
  nameEn?: string;
  active: boolean;
}

export interface AdminArea {
  id: number;
  cityId: number;
  nameAr: string;
  nameEn?: string;
  active: boolean;
}

export interface AdminUser {
  id: number;
  email: string;
  fullNameAr: string;
  fullNameEn?: string;
  phone?: string;
  role: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: number;
  updatedBy?: number;
}

export interface AdminDoctor {
  id: number;
  titleAr?: string;
  titleEn?: string;
  verified: boolean;
  consultationFee?: number;
  clinicId?: number;
}

export interface AdminPayment {
  id: number;
  amount: number;
  status: string;
  paymentMethod: string;
  appointmentId: number;
  createdAt: string;
}

export interface SystemSetting {
  id: number;
  settingKey: string;
  settingValue: string;
  description?: string;
}

export interface AdminDashboard {
  userCount: number;
  clinicCount: number;
  doctorCount: number;
  paymentCount: number;
  unverifiedDoctorCount: number;
}

@Injectable({ providedIn: 'root' })
export class SuperAdminService {
  constructor(private readonly api: ApiService) {}

  getDashboard(): Observable<AdminDashboard> {
    return this.api.get<ApiResponse<AdminDashboard>>(AppConstants.API.ADMIN_DASHBOARD).pipe(
      timeout(8000),
      map((res) => {
        if (!res.data) throw new Error(res.message || 'Dashboard unavailable');
        return res.data;
      })
    );
  }

  getClinics(params: Record<string, string | number | boolean> = {}): Observable<PagedResult<AdminClinic>> {
    return this.api.get<ApiResponse<unknown>>(AppConstants.API.ADMIN_CLINICS, params).pipe(
      map((res) => parsePageResponse<AdminClinic>(res.data))
    );
  }

  saveClinic(clinic: Partial<AdminClinic>): Observable<AdminClinic> {
    return this.api.post<ApiResponse<AdminClinic>>(AppConstants.API.ADMIN_CLINICS, clinic).pipe(
      map((res) => res.data!)
    );
  }

  getUsers(params: Record<string, string | number | boolean> = {}): Observable<PagedResult<AdminUser>> {
    return this.api.get<ApiResponse<unknown>>(AppConstants.API.ADMIN_USERS, params).pipe(
      map((res) => parsePageResponse<AdminUser>(res.data))
    );
  }

  updateUser(id: number, user: Partial<AdminUser>): Observable<AdminUser> {
    return this.api.put<ApiResponse<AdminUser>>(`${AppConstants.API.ADMIN_USERS}/${id}`, user).pipe(
      map((res) => res.data!)
    );
  }

  toggleUserActive(id: number): Observable<AdminUser> {
    return this.api.patch<ApiResponse<AdminUser>>(`${AppConstants.API.ADMIN_USERS}/${id}/toggle-active`, {}).pipe(
      map((res) => res.data!)
    );
  }

  getDoctors(
    verified?: boolean,
    params: Record<string, string | number | boolean> = {}
  ): Observable<PagedResult<AdminDoctor>> {
    const query = { ...params };
    if (verified !== undefined) query['verified'] = verified;
    return this.api.get<ApiResponse<unknown>>(AppConstants.API.ADMIN_DOCTORS, query).pipe(
      map((res) => parsePageResponse<AdminDoctor>(res.data))
    );
  }

  verifyDoctor(id: number, verified: boolean): Observable<AdminDoctor> {
    return this.api.post<ApiResponse<AdminDoctor>>(`${AppConstants.API.ADMIN_DOCTORS}/${id}/verify?verified=${verified}`, {}).pipe(
      map((res) => res.data!)
    );
  }

  getPayments(params: Record<string, string | number | boolean> = {}): Observable<PagedResult<AdminPayment>> {
    return this.api.get<ApiResponse<unknown>>(AppConstants.API.ADMIN_PAYMENTS, params).pipe(
      map((res) => parsePageResponse<AdminPayment>(res.data))
    );
  }

  getSettings(params: Record<string, string | number | boolean> = {}): Observable<PagedResult<SystemSetting>> {
    return this.api.get<ApiResponse<unknown>>(AppConstants.API.ADMIN_SETTINGS, params).pipe(
      map((res) => parsePageResponse<SystemSetting>(res.data))
    );
  }

  updateSetting(key: string, value: string): Observable<SystemSetting> {
    return this.api.put<ApiResponse<SystemSetting>>(`${AppConstants.API.ADMIN_SETTINGS}/${key}?value=${encodeURIComponent(value)}`, {}).pipe(
      map((res) => res.data!)
    );
  }

  saveCity(city: { nameAr: string; nameEn?: string }): Observable<unknown> {
    return this.api.post<ApiResponse<unknown>>(AppConstants.API.ADMIN_CITIES, city).pipe(map((res) => res.data));
  }

  getCities(): Observable<AdminCity[]> {
    return this.api.get<ApiResponse<AdminCity[]>>(AppConstants.API.ADMIN_CITIES).pipe(
      map((res) => res.data ?? [])
    );
  }

  getAreas(cityId: number): Observable<AdminArea[]> {
    return this.api.get<ApiResponse<AdminArea[]>>(AppConstants.API.ADMIN_AREAS, { cityId }).pipe(
      map((res) => res.data ?? [])
    );
  }

  saveArea(area: { cityId: number; nameAr: string; nameEn?: string }): Observable<unknown> {
    return this.api.post<ApiResponse<unknown>>(AppConstants.API.ADMIN_AREAS, area).pipe(map((res) => res.data));
  }
}
