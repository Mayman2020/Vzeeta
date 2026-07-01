import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject, map, tap } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { TokenStorageService } from '../auth/token-storage.service';
import { JwtUtils } from '../utils/jwt-utils';
import {
  ApiResponse,
  CurrentUser,
  LoginRequest,
  LoginResponse,
  PermissionMap,
  RegisterRequest,
  UserRole,
  UserDto
} from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly activeRoleChanged = new Subject<void>();

  constructor(
    private readonly api: ApiService,
    private readonly tokenStorage: TokenStorageService,
    private readonly router: Router
  ) {}

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.api.post<ApiResponse<LoginResponse>>(AppConstants.API.AUTH_LOGIN, request).pipe(
      tap((res) => {
        if (res.data?.accessToken) {
          this.applyLoginResponse(res.data);
        }
      }),
      map((res) => {
        if (!res.success || !res.data) throw new Error(res.message || 'Login failed');
        return res.data;
      })
    );
  }

  register(request: RegisterRequest): Observable<LoginResponse> {
    return this.api.post<ApiResponse<LoginResponse>>(AppConstants.API.AUTH_REGISTER, request).pipe(
      tap((res) => {
        if (res.data?.accessToken) {
          this.applyLoginResponse(res.data);
        }
      }),
      map((res) => {
        if (!res.success || !res.data) throw new Error(res.message || 'Registration failed');
        return res.data;
      })
    );
  }

  changePassword(payload: { currentPassword: string; newPassword: string }): Observable<LoginResponse> {
    return this.api.post<ApiResponse<LoginResponse>>(AppConstants.API.USERS_ME_CHANGE_PASSWORD, payload).pipe(
      tap((res) => {
        if (res.data?.accessToken) {
          this.applyLoginResponse(res.data);
          this.clearMustChangePassword();
        }
      }),
      map((res) => {
        if (!res.success || !res.data) throw new Error(res.message || 'Change password failed');
        return res.data;
      })
    );
  }

  forgotPassword(email: string): Observable<void> {
    return this.api.post<ApiResponse<void>>(AppConstants.API.AUTH_FORGOT_PASSWORD, { email }).pipe(
      map((res) => {
        if (!res.success) throw new Error(res.message || 'Request failed');
      })
    );
  }

  resetPassword(token: string, newPassword: string): Observable<void> {
    return this.api.post<ApiResponse<void>>(AppConstants.API.AUTH_RESET_PASSWORD, { token, newPassword }).pipe(
      map((res) => {
        if (!res.success) throw new Error(res.message || 'Reset failed');
      })
    );
  }

  getChangePasswordRoute(): string {
    return '/auth/change-password';
  }

  logout(): void {
    this.api.post<ApiResponse<void>>(AppConstants.API.AUTH_LOGOUT, {}).subscribe({ error: () => {} });
    this.tokenStorage.clearAll();
    void this.router.navigateByUrl('/auth/login');
  }

  isAuthenticated(): boolean {
    const token = this.tokenStorage.getToken();
    if (!token) return false;
    return !JwtUtils.isExpired(token);
  }

  getCurrentUser(): CurrentUser | null {
    return this.tokenStorage.getUser<CurrentUser>();
  }

  getRole(): UserRole | null {
    return this.getCurrentUser()?.role ?? null;
  }

  hasRole(role: UserRole): boolean {
    return this.getRole() === role;
  }

  mustChangePassword(): boolean {
    return this.getCurrentUser()?.mustChangePassword === true;
  }

  clearMustChangePassword(): void {
    const user = this.getCurrentUser();
    if (user) {
      this.tokenStorage.setUser({ ...user, mustChangePassword: false });
    }
  }

  syncCurrentUserFromDto(dto: UserDto): void {
    const existing = this.getCurrentUser();
    if (!existing) return;
    const fullName = dto.fullNameAr || dto.fullNameEn || dto.fullName || dto.email;
    this.tokenStorage.setUser({
      ...existing,
      ...dto,
      fullName,
      initials: this.buildInitials(fullName)
    });
    this.activeRoleChanged.next();
  }

  getPermissions(): PermissionMap {
    return this.getCurrentUser()?.permissions ?? {};
  }

  updateStoredPermissions(permissions: PermissionMap): void {
    const user = this.getCurrentUser();
    if (!user) return;
    this.tokenStorage.setUser({ ...user, permissions });
  }

  getDashboardRoute(): string {
    switch (this.getRole()) {
      case 'PATIENT': return '/patient/dashboard';
      case 'DOCTOR': return '/doctor/dashboard';
      case 'CLINIC_ADMIN': return '/clinic-admin/dashboard';
      case 'SUPER_ADMIN': return '/super-admin/dashboard';
      default: return '/auth/login';
    }
  }

  clearExpiredTokens(): void {
    const token = this.tokenStorage.getToken();
    if (token && JwtUtils.isExpired(token)) this.tokenStorage.clearAll();
  }

  applyLoginResponse(data: LoginResponse): void {
    this.tokenStorage.setToken(data.accessToken);
    if (data.refreshToken) this.tokenStorage.setRefreshToken(data.refreshToken);
    const userDto = data.user;
    if (!userDto) return;
    const user: CurrentUser = {
      ...userDto,
      permissions: userDto.permissions ?? {},
      mustChangePassword: userDto.mustChangePassword ?? false,
      fullName: userDto.fullNameAr || userDto.fullNameEn || userDto.fullName || userDto.email,
      initials: this.buildInitials(userDto.fullNameAr || userDto.fullNameEn || userDto.fullName || '')
    };
    this.tokenStorage.setUser(user);
  }

  private buildInitials(name: string): string {
    const words = (name ?? '').trim().split(/\s+/).filter(Boolean);
    if (!words.length) return 'U';
    return words.slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');
  }
}
