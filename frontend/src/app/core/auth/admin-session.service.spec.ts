import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { ADMIN_SESSION_KEY, AdminSessionService } from './admin-session.service';

describe('AdminSessionService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  it('should persist admin auth information', () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(AdminSessionService);

    service.setSession({
      token: 'jwt-token',
      email: 'admin@example.com',
      nom: 'Admin',
      prenom: 'Global',
      role: 'GLOBAL',
      siteId: null
    });

    expect(service.isAuthenticated()).toBe(true);
    expect(service.token()).toBe('jwt-token');
    expect(service.isGlobalAdmin()).toBe(true);
  });

  it('should restore admin auth information from localStorage', () => {
    localStorage.setItem(
      ADMIN_SESSION_KEY,
      JSON.stringify({
        token: 'restored-token',
        email: 'site@example.com',
        nom: 'Admin',
        prenom: 'Site',
        role: 'SITE',
        siteId: 2
      })
    );

    TestBed.configureTestingModule({});
    const service = TestBed.inject(AdminSessionService);

    expect(service.isAuthenticated()).toBe(true);
    expect(service.token()).toBe('restored-token');
    expect(service.isSiteAdmin()).toBe(true);
    expect(service.siteId()).toBe(2);
  });

  it('should clear invalid localStorage content', () => {
    localStorage.setItem(ADMIN_SESSION_KEY, 'not-json');

    TestBed.configureTestingModule({});
    const service = TestBed.inject(AdminSessionService);

    expect(service.isAuthenticated()).toBe(false);
    expect(localStorage.getItem(ADMIN_SESSION_KEY)).toBeNull();
  });

  it('should clear admin auth information', () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(AdminSessionService);

    service.setSession({
      token: 'jwt-token',
      email: 'site@example.com',
      nom: 'Admin',
      prenom: 'Site',
      role: 'SITE',
      siteId: 2
    });

    service.clearSession();

    expect(service.isAuthenticated()).toBe(false);
    expect(service.session()).toBeNull();
  });
});
