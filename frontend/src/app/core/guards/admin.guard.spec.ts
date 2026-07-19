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

  it('devrait rediriger vers /admin/login quand aucune session n\'existe', () => {
    const router = TestBed.inject(Router);

    const result = TestBed.runInInjectionContext(() => adminGuard({ data: {} } as never, {} as never));

    expect(result).toEqual(router.parseUrl('/admin/login'));
  });

  it('devrait autoriser l\'accès quand la session existe et qu\'aucun rôle n\'est requis', () => {
    localStorage.setItem(
      ADMIN_SESSION_KEY,
      JSON.stringify({ token: 'x', email: 'a', nom: 'n', prenom: 'p', role: 'GLOBAL', siteId: null })
    );

    const result = TestBed.runInInjectionContext(() => adminGuard({ data: {} } as never, {} as never));

    expect(result).toBe(true);
  });

  it('devrait bloquer l\'accès quand le rôle n\'est pas autorisé', () => {
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

