import type { AuthService } from '../services/auth.service';

/** Full notifications inbox route for the signed-in role. */
export function notificationsInboxRoute(auth: AuthService): string {
  if (auth.getRole() === 'PATIENT') {
    return '/patient/notifications';
  }
  return auth.getDashboardRoute();
}

export function hasNotificationsInbox(auth: AuthService): boolean {
  return auth.getRole() === 'PATIENT';
}

/** Profile route for the signed-in role — Property topbar parity. */
export function profileRouteForRole(auth: AuthService): string {
  switch (auth.getRole()) {
    case 'SUPER_ADMIN':
      return '/super-admin/profile';
    case 'CLINIC_ADMIN':
      return '/clinic-admin/profile';
    case 'DOCTOR':
      return '/doctor/profile';
    case 'PATIENT':
      return '/patient/profile';
    default:
      return '/auth/login';
  }
}
