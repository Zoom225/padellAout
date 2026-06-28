import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AdminSessionService } from '../auth/admin-session.service';
import { TypeAdministrateur } from '../../shared/models/enums.model';

export const adminGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const session = inject(AdminSessionService);

  if (!session.isAuthenticated()) {
    return router.parseUrl('/admin/login');
  }

  const allowedRoles = (route.data?.['roles'] as TypeAdministrateur[] | undefined) ?? [];

  if (!allowedRoles.length) {
    return true;
  }

  const role = session.role();
  if (role && allowedRoles.includes(role)) {
    return true;
  }

  return router.parseUrl('/admin/login');
};
