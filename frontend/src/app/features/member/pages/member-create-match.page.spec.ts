import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MatchesApiService } from '../../../core/api/matches-api.service';
import { MembresApiService } from '../../../core/api/membres-api.service';
import { ReservationsApiService } from '../../../core/api/reservations-api.service';
import { SitesApiService } from '../../../core/api/sites-api.service';
import { TerrainsApiService } from '../../../core/api/terrains-api.service';
import { MemberSessionService } from '../../../core/auth/member-session.service';
import { MatchResponse } from '../../../shared/models/match.model';
import { MembreResponse } from '../../../shared/models/membre.model';
import { SiteResponse, TerrainResponse } from '../../../shared/models/site-terrain.model';
import { MemberCreateMatchPage } from './member-create-match.page';

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

describe('MemberCreateMatchPage', () => {
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

  const sites: SiteResponse[] = [
    {
      id: 1,
      nom: 'Padel Club Lyon',
      adresse: 'Lyon',
      heureOuverture: '08:00',
      heureFermeture: '22:00',
      dureeMatchMinutes: 90,
      dureeEntreMatchMinutes: 15,
      anneeCivile: 2026
    }
  ];

  const terrains: TerrainResponse[] = [
    { id: 10, nom: 'Court A', siteId: 1, siteNom: 'Padel Club Lyon' }
  ];

  const createdMatch: MatchResponse = {
    id: 99,
    terrainId: 10,
    terrainNom: 'Court A',
    siteNom: 'Padel Club Lyon',
    organisateurId: 1,
    organisateurNom: 'Tom Bernard',
    date: '2026-05-10',
    heureDebut: '09:00',
    heureFin: '10:30',
    typeMatch: 'PRIVE',
    statut: 'PLANIFIE',
    nbJoueursActuels: 1,
    prixParJoueur: 15,
    dateConversionPublic: null
  };

  let sitesApiMock: { getAll: ReturnType<typeof vi.fn> };
  let terrainsApiMock: { getBySite: ReturnType<typeof vi.fn> };
  let matchesApiMock: { create: ReturnType<typeof vi.fn> };
  let membresApiMock: { getByMatricule: ReturnType<typeof vi.fn> };
  let reservationsApiMock: { create: ReturnType<typeof vi.fn> };
  let memberSessionMock: {
    isAuthenticated: ReturnType<typeof vi.fn>;
    member: ReturnType<typeof vi.fn>;
  };
  let activatedRouteMock: { snapshot: { queryParamMap: { get: ReturnType<typeof vi.fn> } } };

  beforeEach(async () => {
    sitesApiMock = {
      getAll: vi.fn().mockReturnValue(of(sites))
    };
    terrainsApiMock = {
      getBySite: vi.fn().mockReturnValue(of(terrains))
    };
    matchesApiMock = {
      create: vi.fn().mockReturnValue(of(createdMatch))
    };
    membresApiMock = {
      getByMatricule: vi.fn().mockImplementation((matricule: string) =>
        of({
          id: matricule === 'G1002' ? 2 : 3,
          matricule,
          nom: 'Invite',
          prenom: matricule,
          email: `${matricule.toLowerCase()}@email.com`,
          typeMembre: matricule.startsWith('G') ? 'GLOBAL' : 'LIBRE',
          siteId: null,
          siteNom: null,
          solde: 0
        } satisfies MembreResponse)
      )
    };
    reservationsApiMock = {
      create: vi.fn().mockReturnValue(of({ id: 1 }))
    };
    memberSessionMock = {
      isAuthenticated: vi.fn().mockReturnValue(true),
      member: vi.fn().mockReturnValue(member)
    };
    activatedRouteMock = {
      snapshot: {
        queryParamMap: {
          get: vi.fn().mockReturnValue(null)
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [MemberCreateMatchPage],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: SitesApiService, useValue: sitesApiMock },
        { provide: TerrainsApiService, useValue: terrainsApiMock },
        { provide: MatchesApiService, useValue: matchesApiMock },
        { provide: MembresApiService, useValue: membresApiMock },
        { provide: ReservationsApiService, useValue: reservationsApiMock },
        { provide: MemberSessionService, useValue: memberSessionMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    }).compileComponents();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    TestBed.resetTestingModule();
  });

  it('initialise le site, le terrain et la date minimale pour un membre SITE', () => {
    const fixture = TestBed.createComponent(MemberCreateMatchPage);
    const component = fixture.componentInstance;

    expect(component.isSiteMember()).toBe(true);
    expect(component.form.controls.siteId.value).toBe(1);
    expect(component.form.controls.terrainId.value).toBe(10);
    expect(component.form.controls.date.value).toBe(component.todayDate());
    expect(terrainsApiMock.getBySite).toHaveBeenCalledWith(1);
  });

  it('preselectionne le type PRIVE si le query param type=PRIVE est fourni', () => {
    activatedRouteMock.snapshot.queryParamMap.get.mockReturnValue('PRIVE');
    const fixture = TestBed.createComponent(MemberCreateMatchPage);
    const component = fixture.componentInstance;

    expect(component.form.controls.typeMatch.value).toBe('PRIVE');
  });

  it('bloque la soumission si la date est au dela de la derniere date autorisee', () => {
    const fixture = TestBed.createComponent(MemberCreateMatchPage);
    const component = fixture.componentInstance;
    const tooLateDate = new Date(component.maxBookingDate());
    tooLateDate.setDate(tooLateDate.getDate() + 1);

    component.form.patchValue({
      date: formatDate(tooLateDate),
      heureDebut: '09:00',
      typeMatch: 'PUBLIC'
    });

    component.submit();

    expect(component.form.controls.date.hasError('maxBookingDate')).toBe(true);
    expect(matchesApiMock.create).not.toHaveBeenCalled();
    expect(component.errorMessage()).toContain('Dernière date autorisée');
    expect(component.errorMessage()).toContain(component.maxBookingDate());
  });

  it('crée un match privé et ajoute les joueurs invités', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    vi.useFakeTimers();
    const fixture = TestBed.createComponent(MemberCreateMatchPage);
    const component = fixture.componentInstance;

    component.form.patchValue({
      date: component.todayDate(),
      heureDebut: '09:00',
      typeMatch: 'PRIVE',
      player1: 'g1002',
      player2: 'l10001'
    });

    component.submit();

    expect(matchesApiMock.create).toHaveBeenCalledWith({
      terrainId: 10,
      matchDate: `${component.todayDate()}T09:00:00`,
      matchType: 'PRIVE',
    });
    expect(membresApiMock.getByMatricule).toHaveBeenCalledWith('G1002');
    expect(membresApiMock.getByMatricule).toHaveBeenCalledWith('L10001');
    expect(reservationsApiMock.create).toHaveBeenCalledTimes(2);
    expect(component.message()).toContain('Les invitations sont en attente de paiement');
    vi.runAllTimers();
    expect(navigateSpy).toHaveBeenCalledWith('/member/reservations');
    vi.useRealTimers();
  });

  it('traduit le message backend de delai en message frontend compréhensible', () => {
    matchesApiMock.create.mockReturnValue(
      throwError(() => ({ error: { message: 'Le membre SITE ne peut pas réserver plus de 14 jours à l\'avance.' } }))
    );
    const fixture = TestBed.createComponent(MemberCreateMatchPage);
    const component = fixture.componentInstance;

    component.form.patchValue({
      date: component.todayDate(),
      heureDebut: '09:00',
      typeMatch: 'PUBLIC'
    });

    component.submit();

    expect(component.loading()).toBe(false);
    expect(component.errorMessage()).toContain('Le profil SITE ne peut pas réserver plus de 14 jours');
    expect(component.errorMessage()).toContain(component.maxBookingDate());
  });
  it('affiche une erreur metier sans code HTTP technique', () => {
    matchesApiMock.create.mockReturnValue(
      throwError(() => ({
        status: 400,
        error: {
          status: 400,
          message: 'Vous avez une pénalité active et ne pouvez pas créer de match.'
        }
      }))
    );
    const fixture = TestBed.createComponent(MemberCreateMatchPage);
    const component = fixture.componentInstance;

    component.form.patchValue({
      date: component.todayDate(),
      heureDebut: '09:00',
      typeMatch: 'PUBLIC'
    });

    component.submit();

    expect(component.errorMessage()).toContain('Vous avez une pénalité active');
    expect(component.errorMessage()).not.toContain('code 400');
    expect(component.errorMessage()).not.toContain('Erreur :');
  });
});
