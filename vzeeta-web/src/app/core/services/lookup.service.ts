import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { ApiResponse } from '../models/user.model';

export type LookupType = 'CLINIC_TYPE' | 'PAYMENT_METHOD' | 'APPOINTMENT_STATUS';

export interface LookupItem {
  id: number;
  type: LookupType;
  code: string;
  nameAr: string;
  nameEn: string;
  sortOrder: number;
  active: boolean;
  locked: boolean;
}

export interface CreateLookupRequest {
  type: LookupType;
  code?: string;
  nameAr: string;
  nameEn: string;
  sortOrder?: number;
}

export interface UpdateLookupRequest {
  code: string;
  nameAr: string;
  nameEn: string;
  sortOrder?: number;
  active: boolean;
}

@Injectable({ providedIn: 'root' })
export class LookupService {
  constructor(private readonly api: ApiService) {}

  getByType(type: LookupType): Observable<ApiResponse<LookupItem[]>> {
    return this.api.get<ApiResponse<LookupItem[]>>(AppConstants.API.LOOKUPS_BY_TYPE, { type });
  }

  getAllByType(type: LookupType): Observable<ApiResponse<LookupItem[]>> {
    return this.api.get<ApiResponse<LookupItem[]>>(AppConstants.API.LOOKUPS_ADMIN_BY_TYPE, { type });
  }

  create(payload: CreateLookupRequest): Observable<ApiResponse<LookupItem>> {
    return this.api.post<ApiResponse<LookupItem>>(AppConstants.API.LOOKUPS, payload);
  }

  update(id: number, payload: UpdateLookupRequest): Observable<ApiResponse<LookupItem>> {
    return this.api.put<ApiResponse<LookupItem>>(AppConstants.API.LOOKUP_BY_ID(id), payload);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.api.delete<ApiResponse<void>>(AppConstants.API.LOOKUP_BY_ID(id));
  }
}
