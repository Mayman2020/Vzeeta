import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { ApiResponse, UserDto } from '../models/user.model';

export interface UserProfileUpdateRequest {
  fullNameAr: string;
  fullNameEn?: string;
  phone?: string;
  profileImage?: string;
}

@Injectable({ providedIn: 'root' })
export class UserProfileService {
  constructor(private readonly api: ApiService) {}

  getMyProfile(): Observable<UserDto> {
    return this.api.get<ApiResponse<UserDto>>(AppConstants.API.USERS_ME).pipe(
      map((res) => {
        if (!res.success || !res.data) throw new Error(res.message || 'Profile load failed');
        return res.data;
      })
    );
  }

  updateMyProfile(payload: UserProfileUpdateRequest): Observable<UserDto> {
    return this.api.put<ApiResponse<UserDto>>(AppConstants.API.USERS_ME, payload).pipe(
      map((res) => {
        if (!res.success || !res.data) throw new Error(res.message || 'Profile save failed');
        return res.data;
      })
    );
  }
}
