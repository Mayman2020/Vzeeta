export type UserRole = 'PATIENT' | 'DOCTOR' | 'CLINIC_ADMIN' | 'SUPER_ADMIN';
export const USER_ROLE_VALUES: readonly UserRole[] = ['PATIENT', 'DOCTOR', 'CLINIC_ADMIN', 'SUPER_ADMIN'];

export type PermissionAction =
  | 'enabled'
  | 'menu'
  | 'view'
  | 'create'
  | 'edit'
  | 'delete'
  | 'export'
  | 'approve';

export type ModulePermissions = Record<PermissionAction, boolean>;
export type PermissionMap = Record<string, ModulePermissions>;

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullNameAr: string;
  fullNameEn?: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
}

export interface UserDto {
  id: number;
  email: string;
  fullName?: string;
  fullNameAr?: string;
  fullNameEn?: string;
  phone?: string;
  role: UserRole;
  profileImage?: string;
  profileImageUrl?: string;
  patientId?: number;
  doctorId?: number;
  clinicId?: number;
  permissions?: PermissionMap;
  mustChangePassword?: boolean;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: UserDto;
}

export interface CurrentUser extends UserDto {
  initials: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}
