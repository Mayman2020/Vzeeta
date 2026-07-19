import { environment } from '../../../environments/environment';

type RuntimeWindow = Window & {
  __TB_API_URL__?: string;
  __TB_FILE_URL__?: string;
};

function getRuntimeApiBaseUrl(): string {
  const runtimeApiUrl = typeof window !== 'undefined'
    ? (window as RuntimeWindow).__TB_API_URL__
    : undefined;
  return runtimeApiUrl?.trim() || environment.apiUrl;
}

export const HTTP_HEADERS = {
  ACTIVE_ROLE: 'X-Active-Role',
} as const;

export const AppConstants = {
  PERSISTED_KEYS: {
    ACCESS_TOKEN: 'tb_access_token',
    REFRESH_TOKEN: 'tb_refresh_token',
    CURRENT_USER: 'tb_current_user',
    LANG: 'tb_lang',
  },

  API: {
    baseURL: getRuntimeApiBaseUrl(),

    AUTH_LOGIN: '/auth/login',
    AUTH_REGISTER: '/auth/register',
    AUTH_LOGOUT: '/auth/logout',
    AUTH_REFRESH: '/auth/refresh',
    AUTH_FORGOT_PASSWORD: '/auth/forgot-password',
    AUTH_RESET_PASSWORD: '/auth/reset-password',
    USERS_ME: '/users/me',
    USERS_ME_CHANGE_PASSWORD: '/users/me/change-password',

    DOCTORS: '/public/doctors',
    DOCTOR_BY_ID: (id: number) => `/public/doctors/${id}`,
    DOCTOR_SLOTS: (id: number) => `/public/doctors/${id}/slots`,
    SPECIALTIES: '/public/specialties',
    CITIES: '/public/cities',
    AREAS: '/public/areas',

    APPOINTMENTS: '/patient/appointments',
    APPOINTMENT_BY_ID: (id: number) => `/patient/appointments/${id}`,
    MY_APPOINTMENTS: '/patient/appointments',

    PATIENT_PROFILE: '/patient/profile',
    PATIENT_ATTACHMENTS: '/patient/attachments',
    PATIENT_FAVORITES: '/patient/favorites',
    PATIENT_PRESCRIPTIONS: '/patient/prescriptions',
    PATIENT_LAB_RESULTS: '/patient/lab-results',
    PATIENT_RECORDS: '/patient/medical-records',
    PATIENT_NOTIFICATIONS: '/patient/notifications',
    PATIENT_REVIEWS: '/patient/reviews',

    PAYMENTS: '/payments',
    PAYMENT_BY_APPOINTMENT: (appointmentId: number) => `/payments/appointment/${appointmentId}`,

    DOCTOR_APPOINTMENTS: '/doctor/appointments',
    DOCTOR_PROFILE: '/doctor/profile',
    DOCTOR_EARNINGS: '/doctor/earnings',
    DOCTOR_AVAILABILITY: '/doctor/availability',
    DOCTOR_PRESCRIPTIONS: '/doctor/prescriptions',
    DOCTOR_MEDICAL_RECORDS: '/doctor/medical-records',

    CLINIC_DOCTORS: '/clinic-admin/doctors',
    CLINIC_BRANCHES: '/clinic-admin/branches',
    CLINIC_APPOINTMENTS: '/clinic-admin/appointments',
    CLINIC_PATIENTS: '/clinic-admin/patients',
    CLINIC_SERVICES: '/clinic-admin/services',
    CLINIC_SPECIALTIES: '/clinic-admin/specialties',
    CLINIC_LAB_RESULTS: '/clinic-admin/lab-results',
    CLINIC_ANALYTICS: '/clinic-admin/analytics',

    ADMIN_CLINICS: '/super-admin/clinics',
    ADMIN_USERS: '/super-admin/users',
    ADMIN_VERIFICATION: '/super-admin/doctors/verification',
    ADMIN_CITIES: '/super-admin/cities',
    ADMIN_AREAS: '/super-admin/areas',
    ADMIN_PAYMENTS: '/super-admin/payments',
    ADMIN_SETTINGS: '/super-admin/settings',
    ADMIN_DASHBOARD: '/super-admin/dashboard',
    ADMIN_DOCTORS: '/super-admin/doctors',
    ADMIN_SUBSCRIPTION_PLANS: '/super-admin/subscription-plans',
    ADMIN_CLINIC_SUBSCRIPTIONS: '/super-admin/clinic-subscriptions',
    ADMIN_CLINIC_SUBSCRIPTION_APPROVE: (id: number) => `/super-admin/clinic-subscriptions/${id}/approve`,
    ADMIN_CLINIC_SUBSCRIPTION_REJECT: (id: number) => `/super-admin/clinic-subscriptions/${id}/reject`,
    ADMIN_GRANT_TRIAL: (clinicId: number) => `/super-admin/clinics/${clinicId}/subscriptions/grant-trial`,
    CLINIC_SUBSCRIPTION_CURRENT: '/clinic-admin/subscription/current',
    CLINIC_SUBSCRIPTION_HISTORY: '/clinic-admin/subscription/history',
    CLINIC_SUBSCRIPTION_PLANS: '/clinic-admin/subscription/plans',
    CLINIC_SUBSCRIPTION_SUBMIT: '/clinic-admin/subscription/submit',
    CLINIC_SUBSCRIPTION_PENDING: '/clinic-admin/subscription/pending',
    CLINIC_SUBSCRIPTION_DOCTOR_COUNT: '/clinic-admin/subscription/doctor-count',
    ROLE_PERMISSIONS: '/role-permissions',
    ROLE_PERMISSIONS_ME: '/role-permissions/me',
    ROLE_PERMISSIONS_BY_ROLE: (role: string) => `/role-permissions/${role}`,
    LOOKUPS: '/lookups',
    LOOKUPS_BY_TYPE: '/lookups/by-type',
    LOOKUPS_ADMIN_BY_TYPE: '/lookups/admin/by-type',
    LOOKUP_BY_ID: (id: number) => `/lookups/${id}`,

    NOTIFICATIONS: '/patient/notifications',
    NOTIFICATIONS_UNREAD: '/patient/notifications',

    FILES_UPLOAD: '/files/upload',
  },
} as const;

export function shouldSkipGlobalLoaderForUpload(url: string, method: string): boolean {
  const u = url ?? '';
  const m = (method ?? '').toUpperCase();
  return m === 'POST' && u.includes('/files/upload');
}
