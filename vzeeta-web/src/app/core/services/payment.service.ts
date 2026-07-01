import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { ApiResponse } from '../models/user.model';

export type PaymentMethod = 'ONLINE' | 'CASH';

export interface PaymentInvoice {
  id: number;
  invoiceNumber: string;
  subtotal: number;
  commission: number;
  total: number;
  issuedAt: string;
}

export interface PaymentResponse {
  id: number;
  appointmentId: number;
  amount: number;
  commission?: number;
  status: string;
  paymentMethod: string;
  paidAt?: string;
  invoice?: PaymentInvoice;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  constructor(private readonly api: ApiService) {}

  createPayment(appointmentId: number, paymentMethod: PaymentMethod): Observable<PaymentResponse> {
    return this.api.post<ApiResponse<PaymentResponse>>(AppConstants.API.PAYMENTS, {
      appointmentId,
      paymentMethod
    }).pipe(
      map((res) => {
        if (!res.data) throw new Error(res.message || 'Payment failed');
        return res.data;
      })
    );
  }

  getByAppointment(appointmentId: number): Observable<PaymentResponse> {
    return this.api.get<ApiResponse<PaymentResponse>>(AppConstants.API.PAYMENT_BY_APPOINTMENT(appointmentId)).pipe(
      map((res) => {
        if (!res.data) throw new Error(res.message || 'Payment not found');
        return res.data;
      })
    );
  }
}
