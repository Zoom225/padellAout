import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MatchesApiService } from '../../../core/api/matches-api.service';
import { MembresApiService } from '../../../core/api/membres-api.service';
import { PaiementsApiService } from '../../../core/api/paiements-api.service';
import { ReservationsApiService } from '../../../core/api/reservations-api.service';
import { MemberSessionService } from '../../../core/auth/member-session.service';
import { MatchResponse } from '../../../shared/models/match.model';
import { MemberReservationsPage } from './member-reservations.page';

describe('MemberReservationsPage', () => {
  const organizedMatches: MatchResponse[] = [
    {
      id: 1,
      terrainId: 1,
      terrainNom: 'Court A',
      siteNom: 'Lyon',
      organisateurId: 1,
      organisateurNom: 'Tom Bernard',
      date: '2026-05-14',
      heureDebut: '09:00:00',
      heureFin: '10:30:00',
      typeMatch: 'PUBLIC',
      statut: 'PLANIFIE',
      nbJoueursActuels: 2,
      prixParJoueur: 15,
      dateConversionPublic: null
    },
    {
      id: 2,
      terrainId: 1,
      terrainNom: 'Court A',
      siteNom: 'Lyon',
      organisateurId: 1,
      organisateurNom: 'Tom Bernard',
      date: '2026-05-20',
      heureDebut: '11:00:00',
      heureFin: '12:30:00',
      typeMatch: 'PRIVE',
      statut: 'PLANIFIE',
      nbJoueursActuels: 1,
      prixParJoueur: 15,
      dateConversionPublic: null
    }
  ];

  let matchesApiMock: {
    getByOrganisateur: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    cancel: ReturnType<typeof vi.fn>;
  };
  let reservationsApiMock: {
    getByMembre: ReturnType<typeof vi.fn>;
    getByMatch: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    cancel: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    matchesApiMock = {
      getByOrganisateur: vi.fn().mockReturnValue(of(organizedMatches)),
      update: vi.fn().mockImplementation((id: number, payload: Partial<MatchResponse>) =>
        of({ ...organizedMatches.find((m) => m.id === id)!, ...payload } as MatchResponse)
      ),
      cancel: vi.fn().mockReturnValue(of(void 0))
    };

    reservationsApiMock = {
      getByMembre: vi.fn().mockReturnValue(of([])),
      getByMatch: vi.fn().mockReturnValue(of([])),
      create: vi.fn().mockReturnValue(of({ id: 1 })),
      cancel: vi.fn().mockReturnValue(of(void 0))
    };

    await TestBed.configureTestingModule({
      imports: [MemberReservationsPage],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: MatchesApiService, useValue: matchesApiMock },
        { provide: ReservationsApiService, useValue: reservationsApiMock },
        { provide: MembresApiService, useValue: { getByMatricule: vi.fn() } },
        { provide: PaiementsApiService, useValue: { pay: vi.fn() } },
        { provide: MemberSessionService, useValue: { memberId: vi.fn().mockReturnValue(1) } }
      ]
    }).compileComponents();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    TestBed.resetTestingModule();
  });

  it('n expose que les matchs PRIVE dans la gestion des joueurs', () => {
    const fixture = TestBed.createComponent(MemberReservationsPage);
    const component = fixture.componentInstance;

    expect(component.organisedMatches()).toHaveLength(2);
    expect(component.managedMatches()).toHaveLength(1);
    expect(component.managedMatches()[0].id).toBe(2);
  });

  it('bloque la selection d un match PUBLIC dans la gestion des joueurs', () => {
    const fixture = TestBed.createComponent(MemberReservationsPage);
    const component = fixture.componentInstance;

    component.onManagedMatchChange(1);

    expect(component.managedMatchId()).toBeNull();
    expect(component.errorMessage()).toContain('réservée aux matchs PRIVÉS');
    expect(reservationsApiMock.getByMatch).not.toHaveBeenCalled();
  });

  it('modifie un match PRIVÉ organisé', () => {
    const fixture = TestBed.createComponent(MemberReservationsPage);
    const component = fixture.componentInstance;

    component.onManagedMatchChange(2);
    component.managedMatchForm.patchValue({ date: '2026-05-22', heureDebut: '13:30', typeMatch: 'PRIVE' });
    component.updateManagedMatch();

    expect(matchesApiMock.update).toHaveBeenCalledWith(
      2,
      expect.objectContaining({
        terrainId: 1,
        organisateurId: 1,
        date: '2026-05-22',
        heureDebut: '13:30',
        typeMatch: 'PRIVE'
      })
    );
    expect(component.message()).toContain('Match mis à jour');
  });

  it('supprime (annule) un match PRIVÉ organisé', () => {
    const fixture = TestBed.createComponent(MemberReservationsPage);
    const component = fixture.componentInstance;

    component.onManagedMatchChange(2);
    component.requestDeleteManagedMatch();
    component.deleteManagedMatch();

    expect(matchesApiMock.cancel).toHaveBeenCalledWith(2, 1);
    expect(component.managedMatchId()).toBeNull();
    expect(matchesApiMock.getByOrganisateur).toHaveBeenCalled();
  });
});
