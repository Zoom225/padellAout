import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';
import { AuthApiService } from '../api/auth-api.service';
import { MEMBER_SESSION_KEY } from '../auth/member-session.service';
import { memberGuard } from './member.guard';

describe('memberGuard', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthApiService, useValue: { loginMembre: vi.fn() } }, // ← juste ça
      ],
    });
  });

  it('should redirect to /member when no member session exists', () => {
    const router = TestBed.inject(Router);

    const result = TestBed.runInInjectionContext(() => memberGuard({} as never, {} as never));

    expect(result).toEqual(router.parseUrl('/member'));
  });

  it('should allow access when member session exists', () => {
    localStorage.setItem(
      MEMBER_SESSION_KEY,
      JSON.stringify({
        member: {
          id: 3,
          matricule: 'G1234',
          nom: 'Doe',
          prenom: 'Jane',
          email: 'jane@example.com',
          typeMembre: 'GLOBAL',
          siteId: null,
          siteNom: null,
          solde: 0,
          token: null,
        },
        token: null,
      }),
    );

    const result = TestBed.runInInjectionContext(() => memberGuard({} as never, {} as never));

    expect(result).toBe(true);
  });
});
