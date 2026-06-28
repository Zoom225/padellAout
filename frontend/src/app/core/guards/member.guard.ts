import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MemberSessionService } from '../auth/member-session.service';

export const memberGuard: CanActivateFn = () => {
  const router = inject(Router);
  const session = inject(MemberSessionService);

  if (session.isAuthenticated()) {
    return true;
  }

  return router.parseUrl('/member');
};

