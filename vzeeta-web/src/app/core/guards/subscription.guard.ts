import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { SubscriptionService } from '../services/subscription.service';

export const subscriptionGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const subscriptionService = inject(SubscriptionService);
  const router = inject(Router);

  if (auth.getRole() === 'SUPER_ADMIN') return of(true);

  return subscriptionService.getCurrent().pipe(
    map((current) => (current?.status === 'ACTIVE' ? true : router.createUrlTree(['/clinic-admin/subscription-locked']))),
    catchError(() => of(router.createUrlTree(['/clinic-admin/subscription-locked'])))
  );
};
