import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MembresApiService } from '../../../core/api/membres-api.service';
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

  let membresApiMock: { getByMatricule: ReturnType<typeof vi.fn> };
  let memberSessionMock = {
    isAuthenticated: vi.fn().mockReturnValue(false),
    setMember: vi.fn(),
    login: vi.fn().mockReturnValue(of(member)),
  };

  beforeEach(async () => {
    vi.useFakeTimers();

    membresApiMock = {
      getByMatricule: vi.fn().mockReturnValue(of(member))
    };

    memberSessionMock = {
      isAuthenticated: vi.fn().mockReturnValue(false),
      setMember: vi.fn(),
      login: vi.fn().mockReturnValue(of(member))
    };

    await TestBed.configureTestingModule({
      imports: [MemberHomePage],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: MembresApiService, useValue: membresApiMock },
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
    component.submit();

    expect(memberSessionMock.login).toHaveBeenCalledWith('S10001');
    expect(component.foundMember()).toEqual(member);

    vi.advanceTimersByTime(600);

    expect(navigateSpy).toHaveBeenCalledWith('/member/profile');
  });

  it('affiche un message utile quand le matricule est introuvable', () => {
    memberSessionMock.login.mockReturnValue(
      throwError(() => ({ error: { message: 'Membre introuvable' } })),
    );
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    const fixture = TestBed.createComponent(MemberHomePage);
    const component = fixture.componentInstance;

    component.form.controls.matricule.setValue('L99999');
    component.submit();

    expect(component.loading()).toBe(false);
    expect(component.errorMessage()).toContain('Matricule introuvable');
    expect(component.errorMessage()).toContain('G1001');
    expect(memberSessionMock.setMember).not.toHaveBeenCalled();
    expect(navigateSpy).not.toHaveBeenCalledWith('/member/profile');
  });
});
