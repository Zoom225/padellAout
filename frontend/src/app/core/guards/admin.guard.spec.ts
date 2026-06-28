import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';
import { ADMIN_SESSION_KEY } from '../auth/admin-session.service';
import { adminGuard } from './admin.guard';

describe('adminGuard', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideRouter([])]
    });
  });

  it('should redirect to /admin/login when no session exists', () => {
    const router = TestBed.inject(Router);

    const result = TestBed.runInInjectionContext(() => adminGuard({ data: {} } as never, {} as never));

    expect(result).toEqual(router.parseUrl('/admin/login'));
  });

  it('should allow access when session exists and no role is required', () => {
    localStorage.setItem(
      ADMIN_SESSION_KEY,
      JSON.stringify({ token: 'x', email: 'a', nom: 'n', prenom: 'p', role: 'GLOBAL', siteId: null })
    );

    const result = TestBed.runInInjectionContext(() => adminGuard({ data: {} } as never, {} as never));

    expect(result).toBe(true);
  });

  it('should block access when role is not allowed', () => {
    localStorage.setItem(
      ADMIN_SESSION_KEY,
      JSON.stringify({ token: 'x', email: 'a', nom: 'n', prenom: 'p', role: 'SITE', siteId: 2 })
    );
    const router = TestBed.inject(Router);

    const result = TestBed.runInInjectionContext(
      () => adminGuard({ data: { roles: ['GLOBAL'] } } as never, {} as never)
    );

    expect(result).toEqual(router.parseUrl('/admin/login'));
  });
});

