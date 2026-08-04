import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { JoursFermetureApiService } from '../../../core/api/jours-fermeture-api.service';
import { SitesApiService } from '../../../core/api/sites-api.service';
import { AdminSessionService } from '../../../core/auth/admin-session.service';
import { JourFermetureResponse, SiteResponse } from '../../../shared/models/site-terrain.model';
import { AdminJoursFermeturePage } from './admin-jours-fermeture.page';

describe('AdminJoursFermeturePage', () => {
  const site: SiteResponse = {
    id: 1,
    nom: 'Padel Club Lyon',
    adresse: 'Lyon',
    heureOuverture: '08:00',
    heureFermeture: '22:00',
    dureeMatchMinutes: 90,
    dureeEntreMatchMinutes: 15,
    anneeCivile: 2026
  };

  const jours: JourFermetureResponse[] = [
    { id: 1, date: '2026-08-10', raison: 'Maintenance', global: true, siteId: null, siteNom: null },
    { id: 2, date: '2026-08-11', raison: 'Tournoi', global: false, siteId: 1, siteNom: 'Padel Club Lyon' }
  ];

  let joursApiMock: {
    getAll: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  let sitesApiMock: {
    getAll: ReturnType<typeof vi.fn>;
    getById: ReturnType<typeof vi.fn>;
  };
  let adminSessionMock: {
    isGlobalAdmin: ReturnType<typeof vi.fn>;
    isSiteAdmin: ReturnType<typeof vi.fn>;
    siteId: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    joursApiMock = {
      getAll: vi.fn().mockReturnValue(of(jours)),
      create: vi.fn().mockReturnValue(of(jours[0])),
      delete: vi.fn().mockReturnValue(of(void 0))
    };
    sitesApiMock = {
      getAll: vi.fn().mockReturnValue(of([site])),
      getById: vi.fn().mockReturnValue(of(site))
    };
    adminSessionMock = {
      isGlobalAdmin: vi.fn().mockReturnValue(false),
      isSiteAdmin: vi.fn().mockReturnValue(true),
      siteId: vi.fn().mockReturnValue(1)
    };

    await TestBed.configureTestingModule({
      imports: [AdminJoursFermeturePage],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: JoursFermetureApiService, useValue: joursApiMock },
        { provide: SitesApiService, useValue: sitesApiMock },
        { provide: AdminSessionService, useValue: adminSessionMock }
      ]
    }).compileComponents();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    TestBed.resetTestingModule();
  });

  it('charge uniquement le site de l admin SITE sans erreur parasite', () => {
    const fixture = TestBed.createComponent(AdminJoursFermeturePage);
    const component = fixture.componentInstance;

    expect(joursApiMock.getAll).toHaveBeenCalled();
    expect(sitesApiMock.getById).toHaveBeenCalledWith(1);
    expect(sitesApiMock.getAll).not.toHaveBeenCalled();
    expect(component.sites()).toEqual([site]);
    expect(component.filteredJours()).toEqual(jours);
    expect(component.form.controls.siteId.value).toBe(1);
    expect(component.errorMessage()).toBe('');
  });
});
