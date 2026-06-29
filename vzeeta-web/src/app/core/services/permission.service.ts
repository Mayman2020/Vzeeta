import { Injectable } from '@angular/core';
import { Observable, catchError, of, tap, timeout } from 'rxjs';
import { ApiResponse, PermissionAction, PermissionMap, UserRole } from '../models/user.model';
import { AuthService } from './auth.service';
import { RolePermissionDto, RolePermissionService } from './role-permission.service';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private permissions: PermissionMap = {};

  constructor(
    private readonly auth: AuthService,
    private readonly rolePermissionService: RolePermissionService
  ) {
    this.permissions = this.auth.getPermissions();
  }

  loadMine(role?: UserRole): Observable<ApiResponse<RolePermissionDto> | null> {
    if (!this.auth.isAuthenticated()) {
      return of(null);
    }
    const selectedRole = role ?? this.auth.getRole() ?? undefined;
    return this.rolePermissionService.getMine(selectedRole).pipe(
      timeout(8000),
      tap((res) => {
        const permissions = res.data?.permissions ?? {};
        this.permissions = permissions;
        this.auth.updateStoredPermissions(permissions);
      }),
      catchError(() => of(null))
    );
  }

  can(moduleKey: string, action: PermissionAction = 'view'): boolean {
    if (this.auth.hasRole('SUPER_ADMIN')) {
      return true;
    }
    const module = this.permissions[moduleKey];
    if (!module || module.enabled === false) {
      return false;
    }
    return module[action] === true;
  }

  getPermissions(): PermissionMap {
    return this.permissions;
  }
}
