import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { ApiResponse } from '../models/user.model';
import { Appointment, BookAppointmentRequest } from '../models/appointment.model';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  constructor(private readonly api: ApiService) {}

  listMine(): Observable<Appointment[]> {
    return this.api.get<ApiResponse<PageLike<Appointment>>>(AppConstants.API.MY_APPOINTMENTS, { size: 50 }).pipe(
      map((res) => this.unwrapPage(res.data))
    );
  }

  book(request: BookAppointmentRequest): Observable<Appointment> {
    return this.api.post<ApiResponse<Appointment>>(AppConstants.API.APPOINTMENTS, request).pipe(
      map((res) => {
        if (!res.data) throw new Error(res.message || 'Booking failed');
        return res.data;
      })
    );
  }

  cancel(id: number): Observable<Appointment> {
    return this.api.post<ApiResponse<Appointment>>(`${AppConstants.API.APPOINTMENTS}/${id}/cancel`, {}).pipe(
      map((res) => res.data!)
    );
  }

  reschedule(id: number, appointmentDate: string, startTime: string): Observable<Appointment> {
    return this.api.post<ApiResponse<Appointment>>(`${AppConstants.API.APPOINTMENTS}/${id}/reschedule`, {
      appointmentDate,
      startTime
    }).pipe(map((res) => res.data!));
  }

  private unwrapPage<T>(data: PageLike<T> | T[] | undefined): T[] {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.content)) return data.content;
    return [];
  }
}

interface PageLike<T> {
  content?: T[];
}
