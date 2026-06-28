import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AdminSessionService } from '../auth/admin-session.service';
import { MemberSessionService } from '../auth/member-session.service';

export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const adminSession = inject(AdminSessionService);
  const memberSession = inject(MemberSessionService);

  const token = adminSession.token() || memberSession.token();

  const isApiCall = req.url.startsWith('/api');
  const isLoginCall = req.url.includes('/api/auth/login');

  if (!token || !isApiCall || isLoginCall) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    })
  );
};
