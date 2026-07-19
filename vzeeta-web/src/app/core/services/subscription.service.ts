import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { ApiResponse } from '../models/user.model';
import { PagedResult, parsePageResponse } from '../utils/api-page.util';

export type BillingCycle = 'MONTHLY' | 'YEARLY';
export type ClinicSubscriptionStatus = 'PENDING_PAYMENT' | 'PENDING_APPROVAL' | 'ACTIVE' | 'REJECTED' | 'EXPIRED' | 'CANCELLED';
export type ClinicSubscriptionPaymentMethod = 'RECEIPT_UPLOAD' | 'ONLINE_PLACEHOLDER' | 'ADMIN_GRANT';

export interface SubscriptionPlan {
  id: number;
  nameAr: string;
  nameEn?: string;
  billingCycle: BillingCycle;
  price: number;
  active: boolean;
  sortOrder: number;
}

export interface ClinicSubscription {
  id: number;
  clinicId: number;
  planId?: number;
  status: ClinicSubscriptionStatus;
  paymentMethod: ClinicSubscriptionPaymentMethod;
  receiptUrl?: string;
  amount?: number;
  startDate?: string;
  endDate?: string;
  freeTrial: boolean;
  rejectionReason?: string;
  reviewedBy?: number;
  reviewedAt?: string;
  createdAt: string;
  doctorCount?: number;
  topUp?: boolean;
}

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  constructor(private readonly api: ApiService) {}

  // Super-admin
  getPlans(): Observable<SubscriptionPlan[]> {
    return this.api.get<ApiResponse<SubscriptionPlan[]>>(AppConstants.API.ADMIN_SUBSCRIPTION_PLANS).pipe(
      map((res) => res.data ?? [])
    );
  }

  savePlan(plan: Partial<SubscriptionPlan>): Observable<SubscriptionPlan> {
    return this.api.post<ApiResponse<SubscriptionPlan>>(AppConstants.API.ADMIN_SUBSCRIPTION_PLANS, plan).pipe(
      map((res) => res.data!)
    );
  }

  getClinicSubscriptions(
    status: ClinicSubscriptionStatus | '' | undefined,
    params: Record<string, string | number | boolean> = {}
  ): Observable<PagedResult<ClinicSubscription>> {
    const query = { ...params };
    if (status) query['status'] = status;
    return this.api.get<ApiResponse<unknown>>(AppConstants.API.ADMIN_CLINIC_SUBSCRIPTIONS, query).pipe(
      map((res) => parsePageResponse<ClinicSubscription>(res.data))
    );
  }

  approve(id: number): Observable<ClinicSubscription> {
    return this.api.post<ApiResponse<ClinicSubscription>>(AppConstants.API.ADMIN_CLINIC_SUBSCRIPTION_APPROVE(id), {}).pipe(
      map((res) => res.data!)
    );
  }

  reject(id: number, reason: string): Observable<ClinicSubscription> {
    return this.api.post<ApiResponse<ClinicSubscription>>(AppConstants.API.ADMIN_CLINIC_SUBSCRIPTION_REJECT(id), { reason }).pipe(
      map((res) => res.data!)
    );
  }

  grantTrial(clinicId: number, months: number): Observable<ClinicSubscription> {
    return this.api.post<ApiResponse<ClinicSubscription>>(AppConstants.API.ADMIN_GRANT_TRIAL(clinicId), { months }).pipe(
      map((res) => res.data!)
    );
  }

  // Clinic-admin
  getCurrent(): Observable<ClinicSubscription | null> {
    return this.api.get<ApiResponse<ClinicSubscription | null>>(AppConstants.API.CLINIC_SUBSCRIPTION_CURRENT).pipe(
      map((res) => res.data ?? null)
    );
  }

  getHistory(params: Record<string, string | number | boolean> = {}): Observable<PagedResult<ClinicSubscription>> {
    return this.api.get<ApiResponse<unknown>>(AppConstants.API.CLINIC_SUBSCRIPTION_HISTORY, params).pipe(
      map((res) => parsePageResponse<ClinicSubscription>(res.data))
    );
  }

  getMyPlans(): Observable<SubscriptionPlan[]> {
    return this.api.get<ApiResponse<SubscriptionPlan[]>>(AppConstants.API.CLINIC_SUBSCRIPTION_PLANS).pipe(
      map((res) => res.data ?? [])
    );
  }

  submitPayment(payload: { planId?: number; paymentMethod: ClinicSubscriptionPaymentMethod; receiptUrl?: string; subscriptionId?: number }): Observable<ClinicSubscription> {
    return this.api.post<ApiResponse<ClinicSubscription>>(AppConstants.API.CLINIC_SUBSCRIPTION_SUBMIT, payload).pipe(
      map((res) => res.data!)
    );
  }

  getPendingCharge(): Observable<ClinicSubscription | null> {
    return this.api.get<ApiResponse<ClinicSubscription | null>>(AppConstants.API.CLINIC_SUBSCRIPTION_PENDING).pipe(
      map((res) => res.data ?? null)
    );
  }

  getDoctorCount(): Observable<number> {
    return this.api.get<ApiResponse<number>>(AppConstants.API.CLINIC_SUBSCRIPTION_DOCTOR_COUNT).pipe(
      map((res) => res.data ?? 0)
    );
  }
}
