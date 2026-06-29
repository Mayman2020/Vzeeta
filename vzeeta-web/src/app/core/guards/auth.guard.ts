import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PermissionAction, UserRole } from '../models/user.model';
import { PermissionService } from '../services/permission.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isAuthenticated()) return router.createUrlTree(['/auth/login']);
  return true;
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated()) return router.createUrlTree([auth.getDashboardRoute()]);
  return true;
};

export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isAuthenticated()) return router.createUrlTree(['/auth/login']);
  const role = auth.getRole();
  if (role && allowedRoles.includes(role)) return true;
  return router.createUrlTree([auth.getDashboardRoute()]);
};

export const patientGuard: CanActivateFn = roleGuard(['PATIENT', 'SUPER_ADMIN']);
export const doctorGuard: CanActivateFn = roleGuard(['DOCTOR', 'SUPER_ADMIN']);
export const clinicAdminGuard: CanActivateFn = roleGuard(['CLINIC_ADMIN', 'SUPER_ADMIN']);
export const superAdminGuard: CanActivateFn = roleGuard(['SUPER_ADMIN']);

export const mustChangePasswordGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.mustChangePassword()) return true;
  if (state.url.includes('/super-admin/profile')) return true;
  return router.createUrlTree(['/super-admin/profile'], { queryParams: { changePassword: '1' } });
};

export const permissionGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const permissions = inject(PermissionService);
  const router = inject(Router);
  if (!auth.isAuthenticated()) return router.createUrlTree(['/auth/login']);
  const moduleKey = route.data['permission'] as string | undefined;
  const action = (route.data['permissionAction'] as PermissionAction | undefined) ?? 'view';
  if (!moduleKey || permissions.can(moduleKey, action)) return true;
  return router.createUrlTree([auth.getDashboardRoute()]);
};
