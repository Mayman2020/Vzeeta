import { Routes } from '@angular/router';
import { guestGuard, authGuard } from '../../core/guards/auth.guard';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'forgot-password',
    canActivate: [guestGuard],
    loadComponent: () => import('./forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'reset-password',
    canActivate: [guestGuard],
    loadComponent: () => import('./reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
  },
  {
    path: 'change-password',
    canActivate: [authGuard],
    loadComponent: () => import('./change-password/change-password.component').then(m => m.ChangePasswordComponent)
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
