import { HttpRequest, HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { firstValueFrom, of } from 'rxjs';
import { AdminSessionService } from '../auth/admin-session.service';
import { MemberSessionService } from '../auth/member-session.service';
import { authTokenInterceptor } from './auth-token.interceptor';
import { AuthApiService } from '../api/auth-api.service';

describe('authTokenInterceptor', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthApiService, useValue: { loginMembre: vi.fn() } }, // ← fix
      ],
    });
  });

  it('should attach the bearer token on protected API calls', async () => {
    const session = TestBed.inject(AdminSessionService);
    session.setSession({
      token: 'jwt-token',
      email: 'admin@example.com',
      nom: 'Admin',
      prenom: 'Root',
      role: 'GLOBAL',
      siteId: null
    });

    let receivedRequest!: HttpRequest<unknown>;

    await firstValueFrom(
      TestBed.runInInjectionContext(() =>
        authTokenInterceptor(new HttpRequest('GET', '/api/sites'), (req) => {
          receivedRequest = req;
          return of(new HttpResponse({ status: 200 }));
        })
      )
    );

    expect(receivedRequest?.headers.get('Authorization')).toBe('Bearer jwt-token');
  });

  it('should not attach the token on login call', async () => {
    const session = TestBed.inject(AdminSessionService);
    session.setSession({
      token: 'jwt-token',
      email: 'admin@example.com',
      nom: 'Admin',
      prenom: 'Root',
      role: 'GLOBAL',
      siteId: null
    });

    let receivedRequest!: HttpRequest<unknown>;

    await firstValueFrom(
      TestBed.runInInjectionContext(() =>
        authTokenInterceptor(new HttpRequest('POST', '/api/auth/login', null), (req) => {
          receivedRequest = req;
          return of(new HttpResponse({ status: 200 }));
        })
      )
    );

    expect(receivedRequest?.headers.has('Authorization')).toBe(false);
  });

  it('should use the member token when only the member session exists', async () => {
    const session = TestBed.inject(MemberSessionService);
    session.setMember({
      id: 1,
      matricule: 'G1001',
      nom: 'Doe',
      prenom: 'John',
      email: 'john@example.com',
      typeMembre: 'GLOBAL',
      siteId: null,
      siteNom: null,
      solde: 0,
      token: 'member-token'
    });

    let receivedRequest!: HttpRequest<unknown>;

    await firstValueFrom(
      TestBed.runInInjectionContext(() =>
        authTokenInterceptor(new HttpRequest('GET', '/api/reservations/membre/1'), (req) => {
          receivedRequest = req;
          return of(new HttpResponse({ status: 200 }));
        })
      )
    );

    expect(receivedRequest?.headers.get('Authorization')).toBe('Bearer member-token');
  });
});
