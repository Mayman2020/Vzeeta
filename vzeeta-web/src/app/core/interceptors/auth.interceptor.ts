import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenStorageService } from '../auth/token-storage.service';
import { HTTP_HEADERS } from '../constants/app-constants';
import { CurrentUser } from '../models/user.model';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenStorage = inject(TokenStorageService);
  const token = tokenStorage.getToken();
  const user = tokenStorage.getUser<CurrentUser>();
  const role = user?.role;

  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (role) headers[HTTP_HEADERS.ACTIVE_ROLE] = role;

  if (Object.keys(headers).length > 0) {
    req = req.clone({ setHeaders: headers });
  }
  return next(req);
};
