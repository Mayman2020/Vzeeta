import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { Doctor, DoctorSearchParams, LookupItem, Specialty, TimeSlot } from '../models/doctor.model';
import { ApiResponse } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class DoctorService {
  constructor(private readonly api: ApiService) {}

  search(params: DoctorSearchParams): Observable<Doctor[]> {
    const query: Record<string, string | number> = { size: 50 };
    if (params.name) query['name'] = params.name;
    if (params.specialtyId) query['specialty'] = params.specialtyId;
    if (params.areaId) query['area'] = params.areaId;
    if (params.minPrice != null) query['minPrice'] = params.minPrice;
    if (params.maxPrice != null) query['maxPrice'] = params.maxPrice;
    if (params.minRating) query['minRating'] = params.minRating;
    if (params.consultationType && params.consultationType !== 'ALL') {
      query['consultationType'] = params.consultationType;
    }

    return this.api.get<ApiResponse<{ content?: unknown[] }>>(AppConstants.API.DOCTORS, query).pipe(
      map((res) => (res.data?.content ?? []).map((d) => this.mapDoctor(d as Record<string, unknown>))),
      catchError(() => of([]))
    );
  }

  getById(id: number): Observable<Doctor | null> {
    return this.api.get<ApiResponse<Record<string, unknown>>>(AppConstants.API.DOCTOR_BY_ID(id)).pipe(
      map((res) => (res.data ? this.mapDoctor(res.data, true) : null)),
      catchError(() => of(null))
    );
  }

  getSpecialties(): Observable<Specialty[]> {
    return this.api.get<ApiResponse<Specialty[]>>(AppConstants.API.SPECIALTIES).pipe(
      map((res) => res.data ?? []),
      catchError(() => of([]))
    );
  }

  getCities(): Observable<LookupItem[]> {
    return this.api.get<ApiResponse<LookupItem[]>>(AppConstants.API.CITIES).pipe(
      map((res) => res.data ?? []),
      catchError(() => of([]))
    );
  }

  getAreas(cityId: number): Observable<LookupItem[]> {
    return this.api.get<ApiResponse<LookupItem[]>>(AppConstants.API.AREAS, { cityId }).pipe(
      map((res) => res.data ?? []),
      catchError(() => of([]))
    );
  }

  getTimeSlots(doctorId: number, date: string, consultationType = 'IN_CLINIC'): Observable<TimeSlot[]> {
    return this.api.get<ApiResponse<Record<string, unknown>[]>>(AppConstants.API.DOCTOR_SLOTS(doctorId), { date, consultationType }).pipe(
      map((res) => (res.data ?? []).map((s, i) => this.mapSlot(s, i))),
      catchError(() => of([]))
    );
  }

  private mapDoctor(raw: Record<string, unknown>, detail = false): Doctor {
    const specialtyNames = (raw['specialtyNames'] as string[]) ?? [];
    const acceptsOnline = !!raw['acceptsOnline'];
    const acceptsInClinic = raw['acceptsInClinic'] !== false;
    let consultationType: Doctor['consultationType'] = 'BOTH';
    if (acceptsOnline && !acceptsInClinic) consultationType = 'ONLINE';
    else if (!acceptsOnline && acceptsInClinic) consultationType = 'IN_CLINIC';

    return {
      id: raw['id'] as number,
      fullName: (raw['fullNameEn'] as string) || (raw['fullNameAr'] as string) || '',
      fullNameAr: raw['fullNameAr'] as string,
      fullNameEn: raw['fullNameEn'] as string,
      titleAr: raw['titleAr'] as string,
      specialty: specialtyNames[0] ?? '',
      specialtyNames,
      specialtyIds: detail ? (raw['specialtyIds'] as number[]) : undefined,
      area: (raw['areaNameAr'] as string) ?? '',
      city: '',
      rating: Number(raw['ratingAvg'] ?? 0),
      reviewCount: Number(raw['ratingCount'] ?? 0),
      consultationFee: Number(raw['consultationFee'] ?? 0),
      onlineFee: raw['onlineFee'] != null ? Number(raw['onlineFee']) : undefined,
      consultationType,
      profileImageUrl: raw['profileImage'] as string,
      bio: detail ? ((raw['bioAr'] as string) || (raw['bioEn'] as string)) : undefined,
      yearsExperience: raw['yearsExperience'] != null ? Number(raw['yearsExperience']) : undefined,
      clinicName: raw['clinicNameAr'] as string,
      clinicId: raw['clinicId'] as number,
      verified: !!raw['verified'],
      acceptsOnline,
      acceptsInClinic
    };
  }

  private mapSlot(raw: Record<string, unknown>, index: number): TimeSlot {
    const start = String(raw['startTime'] ?? '').substring(0, 5);
    const end = String(raw['endTime'] ?? '').substring(0, 5);
    return {
      id: `slot-${index}-${start}`,
      time: start,
      startTime: start,
      endTime: end,
      available: raw['available'] !== false
    };
  }
}
