import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MatchesApiService } from '../../../core/api/matches-api.service';
import { ReservationsApiService } from '../../../core/api/reservations-api.service';
import { SitesApiService } from '../../../core/api/sites-api.service';
import { MemberSessionService } from '../../../core/auth/member-session.service';
import { MatchResponse } from '../../../shared/models/match.model';
import { MemberPublicMatchesPage } from './member-public-matches.page';

describe('MemberPublicMatchesPage', () => {
  const farFuture = '2099-05-20';
  const matches: MatchResponse[] = [
    {
      id: 1,
      terrainId: 1,
      terrainNom: 'Court A',
      siteNom: 'Lyon',
      organisateurId: 1,
      organisateurNom: 'Tom Bernard',
      date: farFuture,
      heureDebut: '11:00:00',
      heureFin: '12:30:00',
      typeMatch: 'PUBLIC',
      statut: 'PLANIFIE',
      nbJoueursActuels: 2,
      prixParJoueur: 15,
      dateConversionPublic: null
    },
    {
      id: 2,
      terrainId: 2,
      terrainNom: 'Court B',
      siteNom: 'Paris',
      organisateurId: 9,
      organisateurNom: 'Emma Dubois',
      date: farFuture,
      heureDebut: '13:00:00',
      heureFin: '14:30:00',
      typeMatch: 'PUBLIC',
      statut: 'PLANIFIE',
      nbJoueursActuels: 1,
      prixParJoueur: 15,
      dateConversionPublic: null
    }
  ];

  let matchesApiMock: {
    getPublic: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    cancel: ReturnType<typeof vi.fn>;
  };
  let reservationsApiMock: { create: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    matchesApiMock = {
      getPublic: vi.fn().mockReturnValue(of(matches)),
      update: vi.fn().mockImplementation((id: number, payload: Partial<MatchResponse>) =>
        of({ ...matches.find((m) => m.id === id)!, ...payload } as MatchResponse)
      ),
      cancel: vi.fn().mockReturnValue(of(void 0))
    };

    reservationsApiMock = {
      create: vi.fn().mockReturnValue(of({ id: 10 }))
    };

    await TestBed.configureTestingModule({
      imports: [MemberPublicMatchesPage],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: MatchesApiService, useValue: matchesApiMock },
        { provide: SitesApiService, useValue: { getAll: vi.fn().mockReturnValue(of([{ id: 1, nom: 'Lyon' }, { id: 2, nom: 'Paris' }])) } },
        { provide: ReservationsApiService, useValue: reservationsApiMock },
        { provide: MemberSessionService, useValue: { memberId: vi.fn().mockReturnValue(1) } }
      ]
    }).compileComponents();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    TestBed.resetTestingModule();
  });

  it('identifie correctement les matchs de l’organisateur connecté', () => {
    const fixture = TestBed.createComponent(MemberPublicMatchesPage);
    const component = fixture.componentInstance;

    expect(component.isOrganizer(matches[0])).toBe(true);
    expect(component.isOrganizer(matches[1])).toBe(false);
  });

  it('affiche les matchs de l utilisateur en premier dans la liste filtree', () => {
    const fixture = TestBed.createComponent(MemberPublicMatchesPage);
    const component = fixture.componentInstance;

    const ordered = component.filteredMatches();

    expect(ordered[0].id).toBe(1);
    expect(component.isOrganizer(ordered[0])).toBe(true);
  });

  it('affiche le badge Mon match pour le match organisé par le membre connecté', () => {
    const fixture = TestBed.createComponent(MemberPublicMatchesPage);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Mon match');
  });

  it('met à jour un match organisé depuis la liste publique', () => {
    const fixture = TestBed.createComponent(MemberPublicMatchesPage);
    const component = fixture.componentInstance;

    component.startEdit(matches[0]);
    component.editForm.patchValue({ date: '2099-05-22', heureDebut: '10:30', typeMatch: 'PRIVE' });
    component.saveEdit(matches[0]);

    expect(matchesApiMock.update).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        terrainId: 1,
        organisateurId: 1,
        date: '2099-05-22',
        heureDebut: '10:30',
        typeMatch: 'PRIVE'
      })
    );
  });

  it('supprime (annule) un match organisé depuis la liste publique', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const fixture = TestBed.createComponent(MemberPublicMatchesPage);
    const component = fixture.componentInstance;

    component.cancelOwnMatch(matches[0]);

    expect(matchesApiMock.cancel).toHaveBeenCalledWith(1, 1);
  });

  it('affiche un message clair après une demande de participation', () => {
    const fixture = TestBed.createComponent(MemberPublicMatchesPage);
    const component = fixture.componentInstance;

    component.joinMatch(matches[1]);

    expect(component.message()).toContain("Votre place ne sera confirmée qu'après paiement");
  });
});
