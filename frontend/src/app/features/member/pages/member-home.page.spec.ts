import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../../core/auth/auth.service';
import { MemberSessionService } from '../../../core/auth/member-session.service';
import { MembreResponse } from '../../../shared/models/membre.model';
import { MemberHomePage } from './member-home.page';

describe('MemberHomePage', () => {
  const member: MembreResponse = {
    id: 1,
    matricule: 'S10001',
    nom: 'Bernard',
    prenom: 'Tom',
    email: 'tom.bernard@email.com',
    typeMembre: 'SITE',
    siteId: 1,
    siteNom: 'Padel Club Lyon',
    solde: 0
  };

  let authServiceMock: { loginMember: ReturnType<typeof vi.fn> };
  let memberSessionMock = {
    isAuthenticated: vi.fn().mockReturnValue(false)
  };

  beforeEach(async () => {
    vi.useFakeTimers();

    authServiceMock = {
      loginMember: vi.fn().mockReturnValue(of(member))
    };

    memberSessionMock = {
      isAuthenticated: vi.fn().mockReturnValue(false)
    };

    await TestBed.configureTestingModule({
      imports: [MemberHomePage],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: AuthService, useValue: authServiceMock },
        { provide: MemberSessionService, useValue: memberSessionMock }
      ]
    }).compileComponents();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
    TestBed.resetTestingModule();
  });

  it('redirige vers le profil si un membre est déjà connecté', () => {
    memberSessionMock.isAuthenticated.mockReturnValue(true);
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    TestBed.createComponent(MemberHomePage);

    expect(navigateSpy).toHaveBeenCalledWith('/member/profile');
  });

  it('normalise le matricule, sauvegarde la session et redirige après succès', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    const fixture = TestBed.createComponent(MemberHomePage);
    const component = fixture.componentInstance;

    component.form.controls.matricule.setValue('s10001');
    component.form.controls.password.setValue('Membre1234!');
    component.submit();

    expect(authServiceMock.loginMember).toHaveBeenCalledWith({ matricule: 'S10001', password: 'Membre1234!' });
    expect(component.foundMember()).toEqual(member);

    vi.advanceTimersByTime(600);

    expect(navigateSpy).toHaveBeenCalledWith('/member/profile');
  });

  it('affiche un message utile quand les identifiants sont invalides', () => {
    authServiceMock.loginMember.mockReturnValue(
      throwError(() => ({ error: { message: 'Identifiants invalides' } })),
    );
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    const fixture = TestBed.createComponent(MemberHomePage);
    const component = fixture.componentInstance;

    component.form.controls.matricule.setValue('L99999');
    component.form.controls.password.setValue('wrong-password');
    component.submit();

    expect(component.loading()).toBe(false);
    expect(component.errorMessage()).toContain('Identifiants invalides');
    expect(navigateSpy).not.toHaveBeenCalledWith('/member/profile');
  });
});
